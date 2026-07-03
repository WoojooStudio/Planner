"use client";

import { useState } from "react";
import type { Project, Todo } from "@/lib/types";
import { Check, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  project: Project;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleCollapse: () => void;
};

const IMPORTANCE_LABEL: Record<string, string> = {
  high: "높음",
  mid: "보통",
  low: "낮음",
};

const IMPORTANCE_COLOR: Record<string, string> = {
  high: "#ef4444",
  mid: "#f59e0b",
  low: "#6b7280",
};

function DdayBadge({ deadline }: { deadline: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);

  let label: string;
  let color: string;

  if (diff < 0) {
    label = `D+${Math.abs(diff)}`;
    color = "#ef4444";
  } else if (diff === 0) {
    label = "D-Day";
    color = "#f59e0b";
  } else if (diff <= 14) {
    label = `D-${diff}`;
    color = diff <= 7 ? "#f59e0b" : "#6366f1";
  } else {
    label = `D-${diff}`;
    color = "#6b7280";
  }

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}18`,
        padding: "2px 7px",
        borderRadius: 20,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  );
}

function OrbitRing({
  todos,
  color,
}: {
  todos: Todo[];
  color: string;
}) {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : done / total;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke="#e2ddd6"
        strokeWidth={4}
      />
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={26}
        y={30}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={color}
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
  const isCarried = (todo.carryCount ?? 0) >= 3;

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: todo.done ? "transparent" : isCarried ? "#fef9ec" : "transparent",
        border: "1px solid transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = todo.done ? "#f5f3ef" : isCarried ? "#fef3c7" : "#f5f3ef")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = todo.done
          ? "transparent"
          : isCarried
          ? "#fef9ec"
          : "transparent")
      }
    >
      <button
        onClick={onToggle}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${todo.done ? projectColor : "#c4bdb5"}`,
          background: todo.done ? projectColor : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
        aria-label={todo.done ? "완료 취소" : "완료"}
      >
        {todo.done && <Check size={12} color="#fff" strokeWidth={3} />}
      </button>

      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: todo.done ? "#a8a29e" : "#1c1917",
          textDecoration: todo.done ? "line-through" : "none",
          lineHeight: 1.4,
        }}
      >
        {todo.text}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {isCarried && (
          <span style={{ fontSize: 11, color: "#92400e" }} title={`${todo.carryCount}회 이월`}>
            🔁 {todo.carryCount}
          </span>
        )}
        {todo.importance && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: IMPORTANCE_COLOR[todo.importance],
              flexShrink: 0,
            }}
            title={IMPORTANCE_LABEL[todo.importance]}
          />
        )}
        {todo.estimateMin && (
          <span style={{ fontSize: 11, color: "#a8a29e" }}>{todo.estimateMin}분</span>
        )}
        <button
          onClick={onDelete}
          style={{
            opacity: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#c4bdb5",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
          className="group-hover:opacity-100"
          aria-label="삭제"
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
}: Props) {
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const activeTodos = project.todos.filter((t) => !t.done);
  const doneTodos = project.todos.filter((t) => t.done);

  const handleAdd = () => {
    if (!newTodoText.trim()) {
      setShowInput(false);
      return;
    }
    onAddTodo(newTodoText.trim());
    setNewTodoText("");
    setShowInput(false);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: project.collapsed ? "none" : "1px solid #efefeb",
        }}
      >
        <OrbitRing todos={project.todos} color={project.color} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{project.emoji}</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1c1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {project.name}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            {project.deadline && <DdayBadge deadline={project.deadline} />}
            <span style={{ fontSize: 11, color: "#a8a29e" }}>
              {activeTodos.length}개 남음
            </span>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#a8a29e",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
          aria-label={project.collapsed ? "펼치기" : "접기"}
        >
          {project.collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Todo list */}
      {!project.collapsed && (
        <div style={{ padding: "8px 8px 12px" }}>
          {activeTodos.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              projectColor={project.color}
              onToggle={() => onToggleTodo(t.id)}
              onDelete={() => onDeleteTodo(t.id)}
            />
          ))}

          {doneTodos.length > 0 && (
            <div
              style={{
                margin: "8px 10px 4px",
                fontSize: 11,
                color: "#a8a29e",
                letterSpacing: 0.5,
              }}
            >
              완료 {doneTodos.length}개
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

          {/* Add todo */}
          {showInput ? (
            <div style={{ padding: "6px 10px", display: "flex", gap: 8 }}>
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
                placeholder="할일 입력..."
                style={{
                  flex: 1,
                  fontSize: 13,
                  border: "1px solid #e2ddd6",
                  borderRadius: 8,
                  padding: "7px 10px",
                  background: "#fff",
                  color: "#1c1917",
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 10px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a8a29e",
                fontSize: 12,
                padding: "4px 0",
              }}
            >
              <Plus size={14} />
              할일 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}
