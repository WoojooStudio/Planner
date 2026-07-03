"use client";

import { useState } from "react";
import type { Project, Todo } from "@/lib/types";
import { Check, Clock, ChevronRight } from "lucide-react";

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
  low: "#6b7280",
};

export default function TodayView({ projects, onToggleTodo }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [focusId, setFocusId] = useState<string | null>(null);

  const todayItems: TodayItem[] = projects
    .flatMap((p) =>
      p.todos
        .filter((t) => t.plannedFor === today)
        .map((t) => ({ todo: t, project: p }))
    )
    .sort((a, b) => {
      const imp = { high: 0, mid: 1, low: 2, undefined: 3 };
      return (
        (imp[a.todo.importance as keyof typeof imp] ?? 3) -
        (imp[b.todo.importance as keyof typeof imp] ?? 3)
      );
    });

  const pending = todayItems.filter((i) => !i.todo.done);
  const done = todayItems.filter((i) => i.todo.done);

  const totalMin = pending.reduce((s, i) => s + (i.todo.estimateMin ?? 0), 0);
  const doneCount = done.length;
  const totalCount = todayItems.length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const currentFocus = pending[0];

  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Progress strip */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #efefeb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#78716c" }}>
            오늘 진행률
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: pct === 100 ? "#34d399" : "#6366f1",
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "#efefeb",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#34d399" : "#6366f1",
              borderRadius: 6,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 10,
          }}
        >
          <Stat label="완료" value={`${doneCount}/${totalCount}`} color="#6366f1" />
          {totalMin > 0 && (
            <Stat label="남은 시간" value={`${totalMin}분`} color="#f59e0b" />
          )}
        </div>
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
          <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>
            지금 할 것
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              onClick={() =>
                onToggleTodo(currentFocus.project.id, currentFocus.todo.id)
              }
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: `2px solid ${currentFocus.project.color}`,
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="완료"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1c1917",
                  lineHeight: 1.4,
                }}
              >
                {currentFocus.todo.text}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 3,
                }}
              >
                <span style={{ fontSize: 11, color: currentFocus.project.color }}>
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
                    <Clock size={11} />
                    {currentFocus.todo.estimateMin}분
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Todo list */}
      <div style={{ padding: "8px 8px 12px" }}>
        {pending.slice(1).map(({ todo, project }) => (
          <TodayRow
            key={todo.id}
            todo={todo}
            project={project}
            isFocus={focusId === todo.id}
            onToggle={() => onToggleTodo(project.id, todo.id)}
            onFocus={() => setFocusId(todo.id === focusId ? null : todo.id)}
          />
        ))}

        {pending.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "#a8a29e",
              fontSize: 13,
            }}
          >
            {totalCount === 0 ? "오늘 계획된 할일이 없어요 ✨" : "오늘 할일 모두 완료! 🎉"}
          </div>
        )}

        {done.length > 0 && (
          <>
            <div
              style={{
                margin: "8px 10px 4px",
                fontSize: 11,
                color: "#a8a29e",
                letterSpacing: 0.5,
              }}
            >
              완료 {done.length}개
            </div>
            {done.map(({ todo, project }) => (
              <TodayRow
                key={todo.id}
                todo={todo}
                project={project}
                isFocus={false}
                onToggle={() => onToggleTodo(project.id, todo.id)}
                onFocus={() => {}}
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
  isFocus,
  onToggle,
  onFocus,
}: {
  todo: Todo;
  project: Project;
  isFocus: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: isFocus ? "#f5f3ef" : "transparent",
        cursor: "pointer",
      }}
      onClick={onFocus}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${todo.done ? project.color : "#c4bdb5"}`,
          background: todo.done ? project.color : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
        aria-label={todo.done ? "완료 취소" : "완료"}
      >
        {todo.done && <Check size={11} color="#fff" strokeWidth={3} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: todo.done ? "#a8a29e" : "#1c1917",
            textDecoration: todo.done ? "line-through" : "none",
          }}
        >
          {todo.text}
        </div>
        <div style={{ fontSize: 11, color: project.color, marginTop: 1 }}>
          {project.emoji} {project.name}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {todo.importance && !todo.done && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: IMPORTANCE_COLOR[todo.importance],
            }}
          />
        )}
        {todo.estimateMin && (
          <span style={{ fontSize: 11, color: "#a8a29e" }}>{todo.estimateMin}분</span>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#a8a29e" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
