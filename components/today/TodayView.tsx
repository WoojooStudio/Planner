"use client";

import type { Project, Todo } from "@/lib/types";
import { Check, Clock, Zap } from "lucide-react";

type Props = {
  projects: Project[];
  onToggleTodo: (projectId: string, todoId: string) => void;
};

type TodayItem = {
  todo: Todo;
  project: Project;
};

const IMPORTANCE_COLOR: Record<string, string> = {
  high: "#ef4444",
  mid: "#f59e0b",
  low: "#a8a29e",
};

export default function TodayView({ projects, onToggleTodo }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const todayItems: TodayItem[] = projects
    .flatMap((p) =>
      p.todos
        .filter((t) => t.plannedFor === today)
        .map((t) => ({ todo: t, project: p }))
    )
    .sort((a, b) => {
      const imp: Record<string, number> = { high: 0, mid: 1, low: 2 };
      const ai = imp[a.todo.importance ?? ""] ?? 3;
      const bi = imp[b.todo.importance ?? ""] ?? 3;
      if (ai !== bi) return ai - bi;
      return a.todo.done === b.todo.done ? 0 : a.todo.done ? 1 : -1;
    });

  const pending = todayItems.filter((i) => !i.todo.done);
  const done = todayItems.filter((i) => i.todo.done);
  const doneCount = done.length;
  const totalCount = todayItems.length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const allDone = totalCount > 0 && doneCount === totalCount;
  const pendingMin = pending.reduce((s, i) => s + (i.todo.estimateMin ?? 0), 0);

  const currentFocus = pending[0];

  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Progress header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #efefeb",
          background: allDone ? "#f0fdf4" : undefined,
          transition: "background-color 0.4s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#78716c",
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            오늘 진행률
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: allDone ? "#22c55e" : "#6366f1",
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.3s ease",
            }}
          >
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            background: "#efefeb",
            borderRadius: 6,
            overflow: "hidden",
          }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`오늘 진행률 ${pct}%`}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: allDone
                ? "#22c55e"
                : `linear-gradient(90deg, #6366f1, #8b7cf8)`,
              borderRadius: 6,
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease",
            }}
          />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <Stat
            label="완료"
            value={`${doneCount} / ${totalCount}`}
            color={allDone ? "#22c55e" : "#6366f1"}
          />
          {pendingMin > 0 && (
            <Stat
              label="예상 시간"
              icon={<Clock size={10} />}
              value={
                pendingMin >= 60
                  ? `${Math.floor(pendingMin / 60)}시간 ${pendingMin % 60}분`
                  : `${pendingMin}분`
              }
              color="#f59e0b"
            />
          )}
        </div>

        {/* All done message */}
        {allDone && (
          <div
            className="animate-slide-up"
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#dcfce7",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🎉</span> 오늘 할일 모두 완료!
          </div>
        )}
      </div>

      {/* Focus spotlight */}
      {currentFocus && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #efefeb",
            background: "#eef2ff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 7,
            }}
          >
            <Zap size={11} color="#6366f1" aria-hidden="true" />
            <span
              style={{
                fontSize: 10,
                color: "#6366f1",
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              지금 할 것
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Checkbox — 44px touch target */}
            <button
              onClick={() =>
                onToggleTodo(currentFocus.project.id, currentFocus.todo.id)
              }
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                flexShrink: 0,
                padding: 0,
              }}
              aria-label="완료로 표시"
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${currentFocus.project.color}`,
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
              />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1c1917",
                  lineHeight: 1.4,
                  marginBottom: 3,
                }}
              >
                {currentFocus.todo.text}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: currentFocus.project.color,
                    fontWeight: 500,
                  }}
                >
                  {currentFocus.project.emoji} {currentFocus.project.name}
                </span>
                {currentFocus.todo.estimateMin && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      color: "#a8a29e",
                    }}
                  >
                    <Clock size={11} aria-hidden="true" />
                    {currentFocus.todo.estimateMin}분
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Todo list */}
      <div style={{ padding: "4px 6px 12px" }}>
        {pending.slice(1).map(({ todo, project }) => (
          <TodayRow
            key={todo.id}
            todo={todo}
            project={project}
            onToggle={() => onToggleTodo(project.id, todo.id)}
          />
        ))}

        {totalCount === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              color: "#a8a29e",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <div>오늘 계획된 할일이 없어요</div>
            <div style={{ fontSize: 11, marginTop: 4, color: "#c4bdb5" }}>
              프로젝트 카드에서 오늘 할 일을 추가해보세요
            </div>
          </div>
        )}

        {done.length > 0 && (
          <>
            <div
              style={{
                margin: "8px 10px 2px",
                fontSize: 11,
                color: "#a8a29e",
                letterSpacing: 0.4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={11} aria-hidden="true" />
              완료 {done.length}개
            </div>
            {done.map(({ todo, project }) => (
              <TodayRow
                key={todo.id}
                todo={todo}
                project={project}
                onToggle={() => onToggleTodo(project.id, todo.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TodayRow({
  todo,
  project,
  onToggle,
}: {
  todo: Todo;
  project: Project;
  onToggle: () => void;
}) {
  return (
    <div
      className="interactive-row"
      style={{
        display: "flex",
        alignItems: "center",
        borderRadius: 8,
      }}
    >
      {/* 44px touch target checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          flexShrink: 0,
          padding: 0,
        }}
        aria-label={todo.done ? "완료 취소" : "완료로 표시"}
        aria-pressed={todo.done}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: `2px solid ${todo.done ? project.color : "#c4bdb5"}`,
            background: todo.done ? project.color : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          {todo.done && (
            <Check
              size={10}
              color="#fff"
              strokeWidth={3}
              className="animate-check-pop"
            />
          )}
        </span>
      </button>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <div
          style={{
            fontSize: 13,
            color: todo.done ? "#a8a29e" : "#1c1917",
            textDecoration: todo.done ? "line-through" : "none",
            lineHeight: 1.4,
            transition: "color 0.15s ease",
          }}
        >
          {todo.text}
        </div>
        <div
          style={{
            fontSize: 11,
            color: project.color,
            marginTop: 1,
            fontWeight: 500,
          }}
        >
          {project.emoji} {project.name}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexShrink: 0,
          paddingRight: 8,
        }}
      >
        {todo.importance && !todo.done && (
          <span
            title={todo.importance}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: IMPORTANCE_COLOR[todo.importance],
            }}
          />
        )}
        {todo.estimateMin && (
          <span
            style={{
              fontSize: 11,
              color: "#a8a29e",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {todo.estimateMin}분
          </span>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#a8a29e",
          marginBottom: 1,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color,
          fontVariantNumeric: "tabular-nums",
          transition: "color 0.3s ease",
        }}
      >
        {value}
      </div>
    </div>
  );
}
