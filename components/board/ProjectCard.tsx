"use client";

import { useState, useEffect, useRef } from "react";
import type { Project, Todo } from "@/lib/types";
import { Check, Trash2, Plus, ChevronDown, Settings, X } from "lucide-react";

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
  onUpdateTodo: (todoId: string, patch: Partial<Todo>) => void;
  onToggleCollapse: () => void;
  onColorChange: (color: string) => void;
  onUpdate: (patch: Partial<Project>) => void;
  onDelete: () => void;
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
  onEdit,
}: {
  todo: Todo;
  projectColor: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const isCarried = (todo.carryCount ?? 0) >= 3;

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 180);
  };

  const commitEdit = () => {
    setEditing(false);
    const t = editText.trim();
    if (t && t !== todo.text) onEdit(t);
    else setEditText(todo.text);
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
      {editing ? (
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") { setEditing(false); setEditText(todo.text); }
          }}
          onBlur={commitEdit}
          style={{
            flex: 1,
            fontSize: 13,
            border: "1.5px solid #6366f1",
            borderRadius: 7,
            padding: "5px 8px",
            background: "#fff",
            color: "#1c1917",
            outline: "none",
            boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
            marginRight: 4,
          }}
        />
      ) : (
        <span
          onClick={() => !todo.done && setEditing(true)}
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
            cursor: todo.done ? "default" : "text",
          }}
        >
          {todo.text}
        </span>
      )}

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
  onUpdateTodo,
  onToggleCollapse,
  onColorChange,
  onUpdate,
  onDelete,
}: Props) {
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

        {/* Settings button */}
        <button
          onClick={() => setShowEditModal(true)}
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
            e.currentTarget.style.color = "#78716c";
            e.currentTarget.style.backgroundColor = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a8a29e";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="프로젝트 설정"
        >
          <Settings size={14} />
        </button>
      </header>

      {/* Edit modal */}
      {showEditModal && (
        <ProjectEditModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={(patch) => { onUpdate(patch); setShowEditModal(false); }}
          onDelete={() => { setShowEditModal(false); onDelete(); }}
        />
      )}

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
                onEdit={(text) => onUpdateTodo(t.id, { text })}
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
              onEdit={(text) => onUpdateTodo(t.id, { text })}
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

// ── Project Edit Modal ─────────────────────────────────────────────
function ProjectEditModal({
  project,
  onClose,
  onSave,
  onDelete,
}: {
  project: Project;
  onClose: () => void;
  onSave: (patch: Partial<Project>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    name: project.name,
    emoji: project.emoji,
    deadline: project.deadline ?? "",
    note: project.note ?? "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      emoji: form.emoji || "📁",
      deadline: form.deadline || undefined,
      note: form.note.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,25,23,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in-scale"
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 22,
          width: "100%",
          maxWidth: 340,
          border: "1px solid #e2ddd6",
          boxShadow: "0 16px 48px rgba(28,25,23,0.14)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 id="edit-project-title" style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>
            프로젝트 편집
          </h2>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0", border: "none", borderRadius: 7, color: "#78716c" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Emoji + name */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={form.emoji}
            onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
            style={{ width: 46, height: 38, fontSize: 18, textAlign: "center", border: "1.5px solid #e2ddd6", borderRadius: 8, background: "#fff", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
            maxLength={2}
            aria-label="이모지"
          />
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="프로젝트 이름"
            style={{ flex: 1, height: 38, fontSize: 13, border: "1.5px solid #e2ddd6", borderRadius: 8, padding: "0 10px", background: "#fff", color: "#1c1917", outline: "none" }}
            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2ddd6"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 3 }}>마감일</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            style={{ width: "100%", height: 34, fontSize: 12, border: "1.5px solid #e2ddd6", borderRadius: 7, padding: "0 10px", background: "#fff", color: "#1c1917", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 3 }}>메모</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="선택 사항"
            rows={2}
            style={{ width: "100%", fontSize: 12, border: "1.5px solid #e2ddd6", borderRadius: 7, padding: "7px 10px", background: "#fff", color: "#1c1917", outline: "none", resize: "none", lineHeight: 1.5 }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
          />
        </div>

        <div style={{ display: "flex", gap: 7 }}>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            style={{ flex: 1, height: 36, background: "#6366f1", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600 }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "#4f52d9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            저장
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 36, background: "#f0f0f0", color: "#78716c", border: "none", borderRadius: 9, fontSize: 12 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2ddd6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f0f0")}
          >
            취소
          </button>
        </div>

        {/* Delete */}
        <div style={{ marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: 7 }}>
              <span style={{ fontSize: 12, color: "#78716c", flex: 1, display: "flex", alignItems: "center" }}>정말 삭제할까요?</span>
              <button
                onClick={onDelete}
                style={{ height: 32, padding: "0 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600 }}
              >
                삭제
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ height: 32, padding: "0 12px", background: "#f0f0f0", color: "#78716c", border: "none", borderRadius: 8, fontSize: 12 }}
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: "none", border: "none", fontSize: 12, color: "#ef4444", padding: 0 }}
            >
              프로젝트 삭제…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
