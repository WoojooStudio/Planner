"use client";

import type { Project, Todo } from "@/lib/types";

type Props = {
  projects: Project[];
  viewRange: "2w" | "1m" | "3m";
  onViewRangeChange: (r: "2w" | "1m" | "3m") => void;
};

const RANGE_DAYS: Record<string, number> = { "2w": 14, "1m": 30, "3m": 90 };
const RANGE_LABEL: Record<string, string> = { "2w": "2주", "1m": "1개월", "3m": "3개월" };

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function TimelineView({ projects, viewRange, onViewRangeChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = RANGE_DAYS[viewRange];

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 3);

  const endDate = addDays(startDate, totalDays + 3);

  const allDays: Date[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    allDays.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const totalWidth = allDays.length;

  const todayOffset = Math.round(
    (today.getTime() - startDate.getTime()) / 86400000
  );

  // Build week labels
  const weekLabels: { label: string; col: number }[] = [];
  allDays.forEach((day, i) => {
    if (day.getDay() === 1 || i === 0) {
      const mo = day.getMonth() + 1;
      const date = day.getDate();
      weekLabels.push({ label: `${mo}/${date}`, col: i });
    }
  });

  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #efefeb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#78716c", letterSpacing: 0.5 }}>
          프로젝트 타임라인
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["2w", "1m", "3m"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onViewRangeChange(r)}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                background: viewRange === r ? "#6366f1" : "#efefeb",
                color: viewRange === r ? "#fff" : "#78716c",
                transition: "all 0.15s",
              }}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto", padding: "12px 0" }}>
        <div style={{ minWidth: `${Math.max(600, totalWidth * 20)}px`, padding: "0 16px" }}>
          {/* Date header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `120px 1fr`,
              marginBottom: 8,
            }}
          >
            <div />
            <div
              style={{
                position: "relative",
                height: 20,
              }}
            >
              {weekLabels.map(({ label, col }) => (
                <span
                  key={label + col}
                  style={{
                    position: "absolute",
                    left: `${(col / totalWidth) * 100}%`,
                    fontSize: 10,
                    color: "#a8a29e",
                    whiteSpace: "nowrap",
                    transform: "translateX(-50%)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Project rows */}
          {projects.map((project) => {
            const projStart = project.startDate
              ? new Date(project.startDate)
              : today;
            const projEnd = project.deadline ? new Date(project.deadline) : null;

            const startOff = Math.max(
              0,
              Math.round((projStart.getTime() - startDate.getTime()) / 86400000)
            );
            const endOff = projEnd
              ? Math.min(
                  totalWidth,
                  Math.round((projEnd.getTime() - startDate.getTime()) / 86400000)
                )
              : totalWidth;

            const barLeft = (startOff / totalWidth) * 100;
            const barWidth = Math.max(1, ((endOff - startOff) / totalWidth) * 100);

            const totalTodos = project.todos.length;
            const doneTodos = project.todos.filter((t) => t.done).length;
            const pct = totalTodos === 0 ? 0 : doneTodos / totalTodos;

            // Due milestones (todos with due dates)
            const milestones = project.todos
              .filter((t) => t.due && !t.done)
              .map((t) => {
                const dueOff = Math.round(
                  (new Date(t.due!).getTime() - startDate.getTime()) / 86400000
                );
                return { todo: t, pct: (dueOff / totalWidth) * 100 };
              })
              .filter((m) => m.pct >= 0 && m.pct <= 100);

            const isDanger =
              projEnd && (projEnd.getTime() - today.getTime()) / 86400000 <= 14;

            return (
              <div
                key={project.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  alignItems: "center",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                {/* Project label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{project.emoji}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1c1917",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {project.name}
                  </span>
                </div>

                {/* Bar */}
                <div style={{ position: "relative", height: 28 }}>
                  {/* Background track */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "8px 0",
                      background: "#efefeb",
                      borderRadius: 4,
                    }}
                  />

                  {/* Today line */}
                  <div
                    className="today-line"
                    style={{
                      left: `${(todayOffset / totalWidth) * 100}%`,
                    }}
                  />

                  {/* Project bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: `${barLeft}%`,
                      width: `${barWidth}%`,
                      height: 16,
                      borderRadius: 6,
                      background: isDanger
                        ? `linear-gradient(90deg, ${project.color}, #ef4444)`
                        : project.color,
                      opacity: 0.85,
                      overflow: "hidden",
                    }}
                  >
                    {/* Progress fill */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: `${pct * 100}%`,
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: 6,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  {/* Milestones (due dates) */}
                  {milestones.map(({ todo, pct: mp }) => (
                    <div
                      key={todo.id}
                      title={`${todo.text} (${todo.due})`}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: `${mp}%`,
                        transform: "translate(-50%, -50%)",
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "#fff",
                        border: `2px solid ${project.color}`,
                        zIndex: 5,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
