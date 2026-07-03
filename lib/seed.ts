import type { AppData } from "./types";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const seedData: AppData = {
  projects: [
    {
      id: "p1",
      name: "우주 미션 컨트롤",
      emoji: "🚀",
      color: "#8b7cf8",
      startDate: fmt(today),
      deadline: fmt(addDays(today, 21)),
      note: "대시보드 v2 완성",
      collapsed: false,
      todos: [
        {
          id: "t1",
          text: "Phase 0 설정 완료",
          done: true,
          importance: "high",
          estimateMin: 30,
          plannedFor: fmt(today),
        },
        {
          id: "t2",
          text: "Phase 1 보드 뷰 구현",
          done: false,
          importance: "high",
          estimateMin: 90,
          due: fmt(addDays(today, 1)),
          plannedFor: fmt(today),
        },
        {
          id: "t3",
          text: "타임라인 간트 차트",
          done: false,
          importance: "mid",
          estimateMin: 60,
          due: fmt(addDays(today, 3)),
        },
        {
          id: "t4",
          text: "AI 브레인덤프 분류",
          done: false,
          importance: "mid",
          estimateMin: 45,
          due: fmt(addDays(today, 7)),
        },
        {
          id: "t5",
          text: "Vercel 배포",
          done: false,
          importance: "low",
          estimateMin: 20,
          due: fmt(addDays(today, 18)),
        },
      ],
    },
    {
      id: "p2",
      name: "우주 사주",
      emoji: "🌙",
      color: "#f472b6",
      startDate: fmt(addDays(today, -14)),
      deadline: fmt(addDays(today, 7)),
      note: "랜딩 페이지 + 결제 연동",
      collapsed: false,
      todos: [
        {
          id: "t10",
          text: "결제 모듈 연동",
          done: false,
          importance: "high",
          estimateMin: 120,
          due: fmt(addDays(today, 5)),
          plannedFor: fmt(today),
        },
        {
          id: "t11",
          text: "이메일 PDF 발송",
          done: false,
          importance: "high",
          estimateMin: 60,
          due: fmt(addDays(today, 6)),
        },
        {
          id: "t12",
          text: "SEO 메타태그 정리",
          done: true,
          importance: "mid",
          estimateMin: 30,
        },
      ],
    },
    {
      id: "p3",
      name: "soap ops",
      emoji: "🧼",
      color: "#34d399",
      startDate: fmt(addDays(today, -7)),
      deadline: fmt(addDays(today, 14)),
      note: "재고/주문 운영 시스템",
      collapsed: false,
      todos: [
        {
          id: "t20",
          text: "재고 CSV 임포트",
          done: false,
          importance: "high",
          estimateMin: 45,
          due: fmt(addDays(today, 2)),
        },
        {
          id: "t21",
          text: "주문 상태 알림",
          done: true,
          importance: "mid",
          estimateMin: 30,
        },
      ],
    },
  ],
  events: [
    {
      id: "e1",
      date: fmt(today),
      time: "10:00",
      title: "개발 스프린트 시작",
      projectId: "p1",
    },
    {
      id: "e2",
      date: fmt(addDays(today, 1)),
      time: "14:00",
      title: "사주 서비스 리뷰",
      projectId: "p2",
    },
    {
      id: "e3",
      date: fmt(addDays(today, 3)),
      title: "월간 회고",
    },
  ],
  inbox: [
    { id: "i1", text: "로고 리뉴얼 아이디어 정리", createdAt: new Date().toISOString() },
    { id: "i2", text: "뉴스레터 첫 발행 일정 잡기", createdAt: new Date().toISOString() },
  ],
};
