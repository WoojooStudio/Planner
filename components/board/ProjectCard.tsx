"use client";

import { useState, useEffect, useRef } from "react";
import type { Project, Todo } from "@/lib/types";
import { Check, Trash2, Plus, ChevronDown } from "lucide-react";

const COLOR_SWATCHES = [
  "#8b7cf8", "#6366f1", "#3b82f6", "#0ea5e9",
  "#06b6d4", "#10b981", "#34d399", "#84cc16",
  "#f59e0b", "#f97316", "#ef4444", "#f472b6",
  "#a855f7", "#78716c", "#1c1917",
];

type Props = {
  project: Project;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleCollapse: () => void;
  onColorChange: (color: string) => void;
};

const IMPORTANCE_COLOR: Record<string, string> = {
  high: "#ef4444",
  mid: "#f59e0b",
  low: "#a8a29e",
};

const IMPORTANCE_LABEL: Record<string, string> = {
  high: "중요",
  mid: "보통",
  low: "낮음",
};

function DdayBadge({ deadline }: { deadline: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);

  let label: string;
  let bg: string;
  let fg: string;

  if (diff < 0) {
    label = `D+${Math.abs(diff)}`;
    bg = "#fef2f2";
    fg = "#ef4444";
  } else if (diff === 0) {
    label = "D-Day";
    bg = "#fffbeb";
    fg = "#d97706";
  } else if (diff <= 7) {
    label = `D-${diff}`;
    bg = "#fffbeb";
    fg = "#d97706";
  } else if (diff <= 14) {
    label = `D-${diff}`;
    bg = "#eef2ff";
    fg = "#6366f1";
  } else {
    label = `D-${diff}`;
    bg = "#f8f8f8";
    fg = "#a8a29e";
  }

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: fg,
        background: bg,
        padding: "2px 7px",
        borderRadius: 20,
        letterSpacing: 0.3,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {label}
    </span>
  );
}

function OrbitRing({ todos, color }: { todos: Todo[]; color: string }) {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : done / total;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const isDone = pct === 1 && total > 0;

  return (
    <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx={26} cy={26} r={r} fill="none" stroke="#f0f0f0" strokeWidth={4} />
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={isDone ? "#22c55e" : color}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
      <text
        x={26}
        y={30}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={isDone ? "#22c55e" : color}
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function TodoRow({
  todo,
  projectColor,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  projectColor: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const isCarried = (todo.carryCount ?? 0) >= 3;

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 180);
  };

  return (
    <div
      className="interactive-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        borderRadius: 8,
        background: isCarried && !todo.done ? "#fffbeb" : "transparent",
        opacity: deleting ? 0 : 1,
        transform: deleting ? "translateX(-6px)" : "translateX(0)",
        transition: "opacity 0.18s ease, transform 0.18s ease, background-color 0.15s ease",
      }}
    >
      {/* Checkbox — 44×44 touch target */}
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "none",
          border: "none",
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
            border: `2px solid ${todo.done ? projectColor : "#c4bdb5"}`,
            background: todo.done ? projectColor : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
            flexShrink: 0,
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

      {/* Text */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          lineHeight: 1.45,
          color: todo.done ? "#a8a29e" : "#1c1917",
          textDecoration: todo.done ? "line-through" : "none",
          transition: "color 0.15s ease",
          paddingRight: 4,
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {todo.text}
      </span>

      {/* Meta indicators */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexShrink: 0,
          paddingRight: 4,
        }}
      >
        {isCarried && (
          <span
            title={`${todo.carryCount}회 이월됨`}
            style={{
              fontSize: 10,
              color: "#92400e",
              background: "#fef3c7",
              padding: "1px 5px",
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            ×{todo.carryCount}
          </span>
        )}
        {todo.importance && !todo.done && (
          <span
            title={IMPORTANCE_LABEL[todo.importance]}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: IMPORTANCE_COLOR[todo.importance],
              flexShrink: 0,
            }}
          />
        )}
        {todo.estimateMin && (
          <span
            style={{
              fontSize: 11,
              color: "#a8a29e",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {todo.estimateMin}분
          </span>
        )}

        {/* Delete — 44×44 touch target, visible only on hover via CSS class */}
        <button
          onClick={handleDelete}
          className="row-action"
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#c4bdb5",
            borderRadius: 6,
            padding: 0,
            transition: "color 0.15s ease, background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.backgroundColor = "#fef2f2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#c4bdb5";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={`${todo.text} 삭제`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onToggleCollapse,
  onColorChange,
}: Props) {
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColorPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColorPicker]);

  const activeTodos = project.todos.filter((t) => !t.done);
  const doneTodos = project.todos.filter((t) => t.done);
  const allDone = project.todos.length > 0 && activeTodos.length === 0;

  const handleAdd = () => {
    const text = newTodoText.trim();
    setShowInput(false);
    setNewTodoText("");
    if (text) onAddTodo(text);
  };

  return (
    <article
      className="animate-fade-in card-hover"
      style={{
        background: "#ffffff",
        border: "1px solid #e2ddd6",
        borderRadius: 14,
        overflow: "hidden",
      }}
      aria-label={`${project.name} 프로젝트`}
    >
      {/* Card header */}
      <header
        style={{
          padding: "14px 14px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: project.collapsed ? "none" : "1px solid #f0f0f0",
          background: allDone ? "#f0fdf4" : undefined,
          transition: "background-color 0.3s ease",
        }}
      >
        {/* OrbitRing — click to open color picker */}
        <div ref={pickerRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowColorPicker((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              borderRadius: "50%",
              display: "block",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            aria-label="프로젝트 색상 변경"
            aria-expanded={showColorPicker}
            title="색상 변경"
          >
            <OrbitRing todos={project.todos} color={project.color} />
          </button>

          {/* Color picker popup */}
          {showColorPicker && (
            <div
              className="animate-slide-up"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 30,
                background: "#ffffff",
                border: "1px solid #e2ddd6",
                borderRadius: 12,
                padding: 10,
                boxShadow: "0 8px 24px rgba(28,25,23,0.12)",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 5,
                width: 162,
              }}
              role="dialog"
              aria-label="색상 선택"
            >
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onColorChange(c);
                    setShowColorPicker(false);
                  }}
                  aria-label={c}
                  aria-pressed={project.color === c}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: c,
                    border:
                      project.color === c
                        ? "2.5px solid #1c1917"
                        : "2px solid transparent",
                    transition: "transform 0.12s ease, border 0.12s ease",
                    transform:
                      project.color === c ? "scale(1.15)" : "scale(1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.15)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform =
                      project.color === c ? "scale(1.15)" : "scale(1)")
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>
              {project.emoji}
            </span>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1c1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {project.name}
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 5,
              flexWrap: "wrap",
            }}
          >
            {project.deadline && <DdayBadge deadline={project.deadline} />}
            <span style={{ fontSize: 11, color: "#a8a29e" }}>
              {allDone
                ? "모두 완료 ✓"
                : activeTodos.length === 0
                ? "할일 없음"
                : `${activeTodos.length}개 남음`}
            </span>
          </div>
        </div>

        {/* Collapse toggle — 44×44 */}
        <button
          onClick={onToggleCollapse}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#a8a29e",
            borderRadius: 8,
            padding: 0,
            transition: "color 0.15s ease, background-color 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#6366f1";
            e.currentTarget.style.backgroundColor = "#eef2ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a8a29e";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={project.collapsed ? "펼치기" : "접기"}
          aria-expanded={!project.collapsed}
        >
          <span
            style={{
              display: "block",
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: project.collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={16} />
          </span>
        </button>
      </header>

      {/* Todo list */}
      {!project.collapsed && (
        <div style={{ padding: "4px 6px 10px" }}>
          {activeTodos.map((t, i) => (
            <div
              key={t.id}
              className={`stagger-${Math.min(i + 1, 4)}`}
              style={{ animation: "fade-in 0.2s ease both" }}
            >
              <TodoRow
                todo={t}
                projectColor={project.color}
                onToggle={() => onToggleTodo(t.id)}
                onDelete={() => onDeleteTodo(t.id)}
              />
            </div>
          ))}

          {doneTodos.length > 0 && (
            <div
              style={{
                margin: "6px 10px 2px",
                fontSize: 11,
                color: "#a8a29e",
                letterSpacing: 0.3,
              }}
            >
              완료 {doneTodos.length}
            </div>
          )}
          {doneTodos.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              projectColor={project.color}
              onToggle={() => onToggleTodo(t.id)}
              onDelete={() => onDeleteTodo(t.id)}
            />
          ))}

          {/* Empty state */}
          {project.todos.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "#c4bdb5",
                fontSize: 12,
                padding: "12px 0 4px",
                margin: 0,
              }}
            >
              할일을 추가해보세요
            </p>
          )}

          {/* Add todo */}
          {showInput ? (
            <div
              className="animate-slide-up"
              style={{ padding: "4px 8px" }}
            >
              <input
                autoFocus
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setShowInput(false);
                    setNewTodoText("");
                  }
                }}
                onBlur={handleAdd}
                placeholder="할일 입력… (Enter로 저장)"
                style={{
                  width: "100%",
                  fontSize: 13,
                  border: "1.5px solid #6366f1",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "#fff",
                  color: "#1c1917",
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
                  transition: "box-shadow 0.15s ease",
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                margin: "4px 6px 0",
                height: 36,
                padding: "0 8px",
                background: "none",
                border: "none",
                color: "#a8a29e",
                fontSize: 12,
                borderRadius: 8,
                width: "calc(100% - 12px)",
                transition: "color 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6366f1";
                e.currentTarget.style.backgroundColor = "#eef2ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a8a29e";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Plus size={14} />
              할일 추가
            </button>
          )}
        </div>
      )}
    </article>
  );
}
