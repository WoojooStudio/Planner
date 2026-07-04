"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import ProjectCard from "@/components/board/ProjectCard";
import Schedule from "@/components/board/Schedule";
import TimelineView from "@/components/timeline/TimelineView";
import TodayView from "@/components/today/TodayView";
import InboxCapture from "@/components/inbox/InboxCapture";
import BrainDump from "@/components/ai/BrainDump";
import { Plus, LayoutGrid, GitBranch, CalendarDays, X } from "lucide-react";
import type { Project } from "@/lib/types";

type ViewTab = "board" | "timeline" | "today";
type TimelineRange = "2w" | "1m" | "3m";

const VIEW_TABS: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: "board", label: "보드", icon: <LayoutGrid size={13} /> },
  { id: "timeline", label: "타임라인", icon: <GitBranch size={13} /> },
  { id: "today", label: "오늘", icon: <CalendarDays size={13} /> },
];

const PROJECT_COLORS = [
  "#8b7cf8",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#38bdf8",
  "#f97316",
];

function getTodayLabel() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const months = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];
  return { monthDay: `${months}월 ${date}일`, dayOfWeek: `${day}요일` };
}

function AddProjectModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (p: Omit<Project, "id" | "collapsed" | "todos">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    emoji: "📁",
    color: PROJECT_COLORS[0],
    deadline: "",
    note: "",
  });

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) return;
    onSave({
      name,
      emoji: form.emoji || "📁",
      color: form.color,
      startDate: new Date().toISOString().split("T")[0],
      deadline: form.deadline || undefined,
      note: form.note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 25, 23, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
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
          borderRadius: 18,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          border: "1px solid #e2ddd6",
          boxShadow:
            "0 20px 60px rgba(28,25,23,0.15), 0 4px 16px rgba(28,25,23,0.08)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2
            id="add-project-title"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1c1917",
              margin: 0,
            }}
          >
            새 프로젝트
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0f0f0",
              border: "none",
              borderRadius: 8,
              color: "#78716c",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e2ddd6";
              e.currentTarget.style.color = "#1c1917";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f0f0f0";
              e.currentTarget.style.color = "#78716c";
            }}
            aria-label="닫기"
          >
            <X size={14} />
          </button>
        </div>

        {/* Name + emoji */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div>
            <label
              htmlFor="project-emoji"
              style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 4 }}
            >
              아이콘
            </label>
            <input
              id="project-emoji"
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              style={{
                width: 52,
                height: 40,
                fontSize: 20,
                textAlign: "center",
                border: "1.5px solid #e2ddd6",
                borderRadius: 9,
                background: "#fff",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
              maxLength={2}
              aria-label="프로젝트 이모지"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="project-name"
              style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 4 }}
            >
              이름 *
            </label>
            <input
              id="project-name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="프로젝트 이름"
              style={{
                width: "100%",
                height: 40,
                fontSize: 13,
                border: "1.5px solid #e2ddd6",
                borderRadius: 9,
                padding: "0 12px",
                background: "#fff",
                color: "#1c1917",
                outline: "none",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2ddd6";
                e.target.style.boxShadow = "none";
              }}
              required
            />
          </div>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              color: "#78716c",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            컬러
          </div>
          <div
            style={{ display: "flex", gap: 7 }}
            role="radiogroup"
            aria-label="프로젝트 컬러"
          >
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={form.color === c}
                aria-label={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: c,
                  border:
                    form.color === c
                      ? "3px solid #1c1917"
                      : "2px solid transparent",
                  boxShadow:
                    form.color === c
                      ? `0 0 0 1px ${c}`
                      : "none",
                  transition: "border 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease",
                  transform: form.color === c ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="project-deadline"
            style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 4 }}
          >
            마감일
          </label>
          <input
            id="project-deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            style={{
              width: "100%",
              height: 36,
              fontSize: 12,
              border: "1.5px solid #e2ddd6",
              borderRadius: 8,
              padding: "0 10px",
              background: "#fff",
              color: "#1c1917",
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 18 }}>
          <label
            htmlFor="project-note"
            style={{ fontSize: 10, color: "#78716c", fontWeight: 600, display: "block", marginBottom: 4 }}
          >
            메모
          </label>
          <textarea
            id="project-note"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="선택 사항"
            rows={2}
            style={{
              width: "100%",
              fontSize: 12,
              border: "1.5px solid #e2ddd6",
              borderRadius: 8,
              padding: "8px 10px",
              background: "#fff",
              color: "#1c1917",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            style={{
              flex: 1,
              height: 40,
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              !e.currentTarget.disabled &&
              (e.currentTarget.style.background = "#4f52d9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#6366f1")
            }
          >
            추가
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 40,
              background: "#f0f0f0",
              color: "#78716c",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#e2ddd6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#f0f0f0")
            }
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    data,
    loaded,
    addProject,
    updateProject,
    deleteProject,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addEvent,
    deleteEvent,
    addInbox,
    assignInboxToProject,
    deleteInbox,
  } = useAppData();

  const [view, setView] = useState<ViewTab>("board");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("1m");
  const [showAddProject, setShowAddProject] = useState(false);

  const { monthDay, dayOfWeek } = getTodayLabel();
  const today = new Date().toISOString().split("T")[0];
  const todayPlanned = data.projects.flatMap((p) =>
    p.todos.filter((t) => t.plannedFor === today && !t.done)
  ).length;

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: 240,
          }}
        >
          {[100, 80, 60].map((w, i) => (
            <div
              key={i}
              className={`skeleton stagger-${i + 1}`}
              style={{ height: 14, width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#ffffff" }}>
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(245, 243, 239, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2ddd6",
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Brand + date */}
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#a8a29e",
                letterSpacing: 1.8,
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: 1,
              }}
            >
              Mission Control
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#1c1917",
                  letterSpacing: -0.3,
                  fontFamily: "var(--font-serif)",
                }}
              >
                {monthDay}
              </span>
              <span style={{ fontSize: 12, color: "#a8a29e", fontWeight: 400 }}>
                {dayOfWeek}
              </span>
            </div>
          </div>

          {/* Tab nav */}
          <nav
            style={{ display: "flex", gap: 2 }}
            aria-label="뷰 전환"
            role="tablist"
          >
            {VIEW_TABS.map(({ id, label, icon }) => {
              const isActive = view === id;
              const hasBadge = id === "today" && todayPlanned > 0;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setView(id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    height: 34,
                    borderRadius: 20,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    background: isActive ? "#1c1917" : "transparent",
                    color: isActive ? "#ffffff" : "#78716c",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f0f0f0";
                      e.currentTarget.style.color = "#1c1917";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#78716c";
                    }
                  }}
                >
                  {icon}
                  {label}
                  {hasBadge && (
                    <span
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 6,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#6366f1",
                        border: `1.5px solid ${isActive ? "#1c1917" : "#f8f8f8"}`,
                      }}
                      aria-label={`${todayPlanned}개 대기 중`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 60px" }}
        id="main-content"
      >
        {/* Inbox — always visible */}
        <div style={{ marginBottom: 12 }}>
          <InboxCapture
            inbox={data.inbox}
            projects={data.projects}
            onAdd={addInbox}
            onDelete={deleteInbox}
            onAssign={assignInboxToProject}
          />
        </div>

        {/* Brain Dump — always visible */}
        <div style={{ marginBottom: 16 }}>
          <BrainDump
            projects={data.projects}
            onAddTodos={(items) => {
              const todayStr = new Date().toISOString().split("T")[0];
              items.forEach(({ projectId, todo }) => {
                if (projectId) {
                  addTodo(projectId, todo);
                } else {
                  addInbox(todo.text);
                }
              });
            }}
          />
        </div>

        {/* ── Board ── */}
        {view === "board" && (
          <div className="animate-fade-in">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {data.projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`stagger-${Math.min(i + 1, 4)}`}
                  style={{ animation: "fade-in 0.25s ease both" }}
                >
                  <ProjectCard
                    project={project}
                    onToggleTodo={(todoId) => toggleTodo(project.id, todoId)}
                    onAddTodo={(text) =>
                      addTodo(project.id, {
                        text,
                        done: false,
                        plannedFor: today,
                      })
                    }
                    onDeleteTodo={(todoId) => deleteTodo(project.id, todoId)}
                    onUpdateTodo={(todoId, patch) => updateTodo(project.id, todoId, patch)}
                    onToggleCollapse={() =>
                      updateProject(project.id, {
                        collapsed: !project.collapsed,
                      })
                    }
                    onColorChange={(color) => updateProject(project.id, { color })}
                    onUpdate={(patch) => updateProject(project.id, patch)}
                    onDelete={() => deleteProject(project.id)}
                  />
                </div>
              ))}

              {/* Add project */}
              <button
                onClick={() => setShowAddProject(true)}
                style={{
                  background: "transparent",
                  border: "1.5px dashed #d6d0c8",
                  borderRadius: 14,
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: "#a8a29e",
                  fontSize: 12,
                  fontWeight: 500,
                  transition: "border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease",
                  minHeight: 90,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#6366f1";
                  e.currentTarget.style.backgroundColor = "#eef2ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d6d0c8";
                  e.currentTarget.style.color = "#a8a29e";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="새 프로젝트 추가"
              >
                <Plus size={16} />
                새 프로젝트
              </button>
            </div>

            <Schedule
              events={data.events}
              projects={data.projects}
              onAdd={addEvent}
              onDelete={deleteEvent}
            />
          </div>
        )}

        {/* ── Timeline ── */}
        {view === "timeline" && (
          <div className="animate-fade-in">
            <TimelineView
              projects={data.projects}
              viewRange={timelineRange}
              onViewRangeChange={setTimelineRange}
            />
          </div>
        )}

        {/* ── Today ── */}
        {view === "today" && (
          <div className="animate-fade-in">
            <TodayView projects={data.projects} onToggleTodo={toggleTodo} />
          </div>
        )}
      </main>

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onSave={addProject}
        />
      )}
    </div>
  );
}
