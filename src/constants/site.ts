const handle = "lukekeum";
const linkedinHandle = "jungbinkeum0222";

export const site = {
  name: "Keum Jungbin",
  nameKo: "금정빈",
  handle,
  role: "Backend Developer",
  roleKo: "백엔드 개발자",
  organization: {
    name: "성균관대학교 SKKUDING 동아리",
    position: "부회장",
  },
  url: "https://lukekeum.me",
  location: "Suwon, KR",
  year: 2026,
  description:
    "성균관대학교 개발 동아리 SKKUDING에서 백엔드 개발을 맡고 있습니다. 작업물과 그 뒤의 이야기를 정리해 곧 공개할 예정이니, 그동안 궁금한 점이 있다면 편하게 연락 주세요.",
  temporaryNotice:
    "이 페이지는 정식 포트폴리오를 준비하는 동안 임시로 만든 페이지입니다.",
  email: "lukekeum11@gmail.com",
  links: {
    github: {
      label: "GitHub",
      handle,
      href: `https://github.com/${handle}`,
    },
    linkedin: {
      label: "LinkedIn",
      handle: linkedinHandle,
      href: `https://www.linkedin.com/in/${linkedinHandle}`,
    },
  },
} as const;
