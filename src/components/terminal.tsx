"use client";

import { site } from "@/constants/site";
import TerminalInput from "@/components/terminal-input";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState, type ReactNode } from "react";

type Line = { id: number; kind: "input" | "output"; text: ReactNode };
type Ctx = {
  open: (href: string) => void;
  clear: () => void;
  close: () => void;
  history: string[];
};

const initialLine: Line[] = [
  {
    id: 0,
    kind: "output",
    text: "안녕하세요! 저의 작업공간에 오신걸 환영합니다.\n\n\tKeum Jungbin - Backend Developer\n\tSite: lukekeum.me\n\tGithub: lukekeum\n\tLinkedIn: jungbinkeum0222\n\tContactMe: lukekeum11@gmail.com\n\n'help'을 입력하면 할 수 있는 일들이 나올거에요.",
  },
];

const description =
  "성균관대학교 개발 동아리 SKKUDING에서 백엔드 개발을 맡고 있습니다. 작업물과 그 뒤의 이야기를 정리해 곧 공개할 예정이니, 그동안 궁금한 점이 있다면 편하게 연락 주세요.";

const contactLines = [
  "Github: https://github.com/lukekeum",
  "LinkedIn: https://www.linkedin.com/in/jungbinkeum0222",
  "Email: lukekeum11@gmail.com",
].concat("\n");

const PROMPT = "guest@lukekeum:~$";

const commands: Record<
  string,
  { hint?: string; run: (args: string[], ctx: Ctx) => ReactNode }
> = {
  help: {
    hint: "명령어 목록",
    run: () => (
      <>
        <dl className="terminal-help">
          {Object.entries(commands)
            .filter(([, command]) => command.hint)
            .map(([name, command]) => (
              <React.Fragment key={name}>
                <dt>{name}</dt>
                <dd>{command.hint}</dd>
              </React.Fragment>
            ))}
        </dl>
        <p className="mt-4">..목록에 없는 명령어도 몇 개 있어요 ㅎㅎ</p>
      </>
    ),
  },
  whoami: {
    hint: "자기소개",
    run: () =>
      `금정빈(Keum Jungbin) \n성균관대학교 SKKUDING 동아리 백엔드 개발자 | 부회장`,
  },
  ls: {
    hint: "파일 목록",
    run: (args) => {
      return args[0]?.startsWith("projects")
        ? "(empty) - 아직 짓는 중이니 기다려봐요"
        : "about.md    contact.txt    projects/";
    },
  },
  cat: {
    hint: "파일 읽기 (원래 연결이지만 읽기만 해봐요)",
    run: (args) => {
      const file = args[0];
      if (!file) return "cat: 읽을 파일을 적어봐요. 예) cat about.md";
      if (file === "about.md") return description;
      if (file === "contact.txt") return contactLines;
      if (file.startsWith("projects"))
        return `cat: ${file}: 디렉터리입니다. (그리고 비어 있어요)`;
      return `cat: ${file}: 그런 파일은 없습니다`;
    },
  },
  cd: {
    run: (args) =>
      args[0]?.startsWith("projects")
        ? "cd: projects: 공사 구역 — 안전모 없이 출입 금지"
        : "cd: 여기가 제일 좋은 자리입니다",
  },
  contact: { hint: "연락처", run: () => contactLines },
  github: {
    hint: "GitHub 열기",
    run: (_, ctx) => {
      ctx.open(site.links[0].href);
      return `Opening ${site.links[0].href} …`;
    },
  },
  linkedin: {
    hint: "LinkedIn 열기",
    run: (_, ctx) => {
      ctx.open(site.links[1].href);
      return `Opening ${site.links[1].href} …`;
    },
  },
  curl: {
    run: (args) => {
      const target = args.find((a) => !a.startsWith("-"));
      if (!target) return "curl: try 'curl lukekeum.me'";
      if (!target.includes(site.url.replace("https://", "")))
        return `curl: (6) 이 터미널은 집 밖으로 못 나갑니다: ${target}`;
      return `HTTP/1.1 503 Service Unavailable\nRetry-After: soon\nContent-Type: application/json\n\n{ "status": "building", "message": "곧 열립니다" }`;
    },
  },
  git: {
    run: (args) => {
      if (args[0] === "status")
        return "On branch main\nYour portfolio is behind 'expectations' by many commits.\n  (use \"patience\" to update)";
      if (args[0] === "log")
        return "a1b2c3d  feat: 랜딩 페이지 공사 시작\n9f8e7d6  chore: 커피 리필\n0000000  init: 마음먹음";
      if (args[0] === "push" && args.includes("--force"))
        return "remote: 여기선 force push 금지입니다. 마음도, 브랜치도.";
      return "git: 'git status'나 'git log'를 시도해 보세요";
    },
  },
  sudo: {
    run: (args) =>
      args.length
        ? "Permission denied: 마감은 sudo로 해결되지 않습니다."
        : "usage: sudo <소원>",
  },
  rm: {
    run: (args) =>
      args.some((a) => a.startsWith("-") && a.includes("r"))
        ? "rm: 지울 게 없습니다. projects/는 원래 비어 있어요."
        : "rm: 권한이 없습니다 (다행히도)",
  },
  make: {
    run: (args) =>
      args[0] === "coffee"
        ? "make: *** No rule to make target 'coffee'. 직접 내려야 합니다."
        : `make: *** No rule to make target '${args[0] ?? "portfolio"}'. 아직 짓는 중이라서요.`,
  },
  date: {
    run: () =>
      `${new Date().toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" })}\n오픈 예정일: 커밋이 정합니다`,
  },
  pwd: { run: () => "/home/lukekeum/portfolio (under construction)" },
  echo: { run: (args) => args.join(" ") },
  ping: { run: () => "PONG — 살아 있습니다. 짓는 중이라 좀 바쁠 뿐." },
  vim: { run: () => "vim에 들어오셨군요. 나가는 법은… ':q' 를 입력해 보세요." },
  ":q": {
    run: (_, ctx) => {
      ctx.close();
      return "";
    },
  },
  history: {
    hint: "입력 기록",
    run: (_, ctx) =>
      ctx.history
        .map((h, i) => `${String(i + 1).padStart(3)}  ${h}`)
        .join("\n") || "(비어 있음)",
  },
  clear: {
    hint: "화면 지우기",
    run: (_, ctx) => {
      ctx.clear();
      return "";
    },
  },
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(initialLine);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);

  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const execute = () => {
    const raw = value.trim();
    setValue("");
    setCursor(null);

    const input: Line = { id: nextId.current++, kind: "input", text: raw };
    if (!raw) {
      setLines((prev) => [...prev, input]);
      return;
    }

    const nextHistory = [...history, raw];
    setHistory(nextHistory);

    let cleared = false;
    let exit = false;
    const [name, ...args] = raw.split(/\s+/);
    const command = commands[name.toLowerCase()];
    const output = command
      ? command.run(args, {
          open: (href) => window.open(href, "_blank", "noopener,noreferrer"),
          close: () => {
            exit = true;
          },
          clear: () => (cleared = true),
          history: nextHistory,
        })
      : `command not found: ${name}\n'help'를 입력해 보세요.`;

    if (exit) {
      setLines(initialLine);
      setHistory([]);
      return;
    }

    if (cleared) {
      setLines([]);
      return;
    }
    setLines((prev) => [
      ...prev,
      input,
      ...(output
        ? [{ id: nextId.current++, kind: "output" as const, text: output }]
        : []),
    ]);
  };

  const onSubmitKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      execute();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const isArrowUp = e.key === "ArrowUp";
      const base = cursor ?? history.length;
      const next = Math.min(
        Math.max(base + (isArrowUp ? -1 : 1), 0),
        history.length,
      );
      setCursor(next === history.length ? null : next);
      setValue(history[next] ?? "");
    } else if (e.key === "Tab") {
      const matches = Object.keys(commands).filter(
        (c) => c.startsWith(value) && commands[c].hint,
      );
      if (value && matches.length === 1 && !e.shiftKey) {
        e.preventDefault();
        setValue(matches[0] + " ");
      }
    }
  };

  return (
    <section aria-label="터미널" className="terminal">
      <div ref={scrollRef} aria-live="polite" className="terminal-scroll">
        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              "whitespace-pre-wrap",
              line.kind === "output" && "mb-2 text-background/75",
            )}
          >
            {line.kind === "input" && (
              <span className="mr-2 text-violet-400 font-bold">{PROMPT}</span>
            )}
            {line.text}
          </div>
        ))}

        <div className="flex items-center">
          <label
            htmlFor="terminal-input"
            className="mr-2 shrink-0 text-violet-400 font-bold"
          >
            {PROMPT}
          </label>
          <TerminalInput
            inputRef={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onSubmitKey}
          />
        </div>
      </div>
    </section>
  );
}
