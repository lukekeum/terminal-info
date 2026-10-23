"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ChangeEventHandler,
  type KeyboardEventHandler,
  type RefObject,
} from "react";

type TerminalInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
};

export default function TerminalInput({
  inputRef,
  value,
  onChange,
  onKeyDown,
}: TerminalInputProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const composingRef = useRef(false);

  const syncCaret = useCallback(() => {
    const input = inputRef.current;
    const field = fieldRef.current;
    const mirror = mirrorRef.current;
    const caret = caretRef.current;
    if (!input || !field || !mirror || !caret) return;

    const start = input.selectionStart ?? input.value.length;
    const showCaret =
      document.activeElement === input &&
      start === input.selectionEnd &&
      !composingRef.current;

    field.dataset.customCaret = String(showCaret);
    if (!showCaret) return;

    // Measure rendered text so Korean characters and horizontal scrolling align.
    mirror.textContent = input.value.slice(0, start);
    const left = mirror.getBoundingClientRect().width - input.scrollLeft;
    const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });
    const character =
      segmenter.segment(input.value.slice(start))[Symbol.iterator]().next()
        .value?.segment ?? " ";
    mirror.textContent = character;
    caret.textContent = character;
    caret.style.width = `${mirror.getBoundingClientRect().width}px`;
    caret.style.left = `${Math.max(0, left)}px`;
  }, [inputRef]);

  useLayoutEffect(() => {
    syncCaret();
  }, [value, syncCaret]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    let frame = 0;
    const scheduleSync = (event?: Event) => {
      if (event?.type === "compositionstart") composingRef.current = true;
      if (event?.type === "compositionend") composingRef.current = false;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncCaret);
    };
    const events = [
      "focus", "blur", "select", "scroll", "keyup", "click",
      "compositionstart", "compositionend",
    ];
    for (const event of events) input.addEventListener(event, scheduleSync);
    document.addEventListener("selectionchange", scheduleSync);
    document.fonts.addEventListener("loadingdone", scheduleSync);
    const observer = new ResizeObserver(() => scheduleSync());
    observer.observe(input);
    scheduleSync();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const event of events) input.removeEventListener(event, scheduleSync);
      document.removeEventListener("selectionchange", scheduleSync);
      document.fonts.removeEventListener("loadingdone", scheduleSync);
    };
  }, [inputRef, syncCaret]);

  return (
    <div ref={fieldRef} className="terminal-input">
      <input
        id="terminal-input"
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        enterKeyHint="send"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <span ref={mirrorRef} className="terminal-input-mirror" aria-hidden="true" />
      <span ref={caretRef} className="terminal-caret" aria-hidden="true" />
    </div>
  );
}
