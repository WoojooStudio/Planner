"use client";

import { useState, useEffect, useRef } from "react";
import { useAppData } from "@/hooks/useAppData";
import ProjectCard from "@/components/board/ProjectCard";
import Schedule from "@/components/board/Schedule";
import TimelineView from "@/components/timeline/TimelineView";
import TodayView from "@/components/today/TodayView";
import InboxCapture from "@/components/inbox/InboxCapture";
import { Plus, LayoutGrid, GitBranch, CalendarDays } from "lucide-react";
import type { Project } from "@/lib/types";

type ViewTab = "board" | "timeline" | "today";
type TimelineRange = "2w" | "1m" | "3m";

const VIEW_LABELS: Record<ViewTab, { label: string; icon: React.ReactNode }> = {
  board: { label: "보드", icon: <LayoutGrid size={14} /> },
  timeline: { label: "타임라인", icon: <GitBranch size={14} /> },
  today: { label: "오늘", icon: <CalendarDays size={14} /> },
};

function getTodayString() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
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
    color: "#8b7cf8",
    deadline: "",
    note: "",
  });
  const COLORS = ["#8b7cf8", "#f472b6", "#34d399", "#fbbf24", "#38bdf8", "#f97316"];

  const handleSave = () => {
    if (!form.name.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    onSave({
      name: form.name.trim(),
      emoji: form.emoji,
      color: form.color,
      startDate: today,
      deadline: form.deadline || undefined,
      note: form.note || undefined,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "#faf9f7",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          maxWidth: 380,
          border: "1px solid #e2ddd6",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          새 프로젝트
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={form.emoji}
            onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
            style={{
              width: 52,
              fontSize: 22,
              textAlign: "center",
              border: "1px solid #e2ddd6",
              borderRadius: 8,
              padding: "8px",
              background: "#fff",
            }}
            maxLength={2}
          />
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="프로젝트 이름"
            style={{
              flex: 1,
              fontSize: 14,
              border: "1px solid #e2ddd6",
              borderRadius: 8,
              padding: "8px 12px",
              background: "#fff",
              color: "#1c1917",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: c,
                border: form.color === c ? "3px solid #1c1917" : "2px solid transparent",
                cursor: "pointer",
              }}
              aria-label={c}
            />
          ))}
        </div>

        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          style={{
            width: "100%",
            fontSize: 13,
            border: "1px solid #e2ddd6",
            borderRadius: 8,
            padding: "8px 12px",
            background: "#fff",
            color: "#1c1917",
            marginBottom: 10,
          }}
        />

        <textarea
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="메모 (선택)"
          rows={2}
          style={{
            width: "100%",
            fontSize: 13,
            border: "1px solid #e2ddd6",
            borderRadius: 8,
            padding: "8px 12px",
            background: "#fff",
            color: "#1c1917",
            marginBottom: 14,
            resize: "none",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "10px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            추가
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: "#efefeb",
              color: "#78716c",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              cursor: "pointer",
            }}
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

  const todayStr = getTodayString();

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f3ef",
          color: "#a8a29e",
          fontSize: 14,
        }}
      >
        불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#f5f3ef" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "#f5f3ef",
          borderBottom: "1px solid #e2ddd6",
          zIndex: 50,
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#a8a29e",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 1,
              }}
            >
              Mission Control
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1917" }}>
              {todayStr}
            </div>
          </div>

          {/* Tab navigation */}
          <nav style={{ display: "flex", gap: 4 }}>
            {(Object.keys(VIEW_LABELS) as ViewTab[]).map((tab) => {
              const { label, icon } = VIEW_LABELS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: view === tab ? "#1c1917" : "transparent",
                    color: view === tab ? "#faf9f7" : "#78716c",
                    transition: "all 0.15s",
                  }}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px 20px 40px",
        }}
      >
        {/* Inbox — always visible */}
        <div style={{ marginBottom: 16 }}>
          <InboxCapture
            inbox={data.inbox}
            projects={data.projects}
            onAdd={addInbox}
            onDelete={deleteInbox}
            onAssign={assignInboxToProject}
          />
        </div>

        {/* ── Board view ─────────────────────────────────────────── */}
        {view === "board" && (
          <div className="animate-fade-in">
            {/* Project grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {data.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onToggleTodo={(todoId) => toggleTodo(project.id, todoId)}
                  onAddTodo={(text) =>
                    addTodo(project.id, {
                      text,
                      done: false,
                      plannedFor: new Date().toISOString().split("T")[0],
                    })
                  }
                  onDeleteTodo={(todoId) => deleteTodo(project.id, todoId)}
                  onToggleCollapse={() =>
                    updateProject(project.id, { collapsed: !project.collapsed })
                  }
                />
              ))}

              {/* Add project button */}
              <button
                onClick={() => setShowAddProject(true)}
                style={{
                  background: "transparent",
                  border: "1.5px dashed #c4bdb5",
                  borderRadius: 16,
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: "#a8a29e",
                  fontSize: 13,
                  transition: "all 0.15s",
                  minHeight: 80,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#c4bdb5";
                  e.currentTarget.style.color = "#a8a29e";
                }}
              >
                <Plus size={16} />
                새 프로젝트
              </button>
            </div>

            {/* Schedule */}
            <Schedule
              events={data.events}
              projects={data.projects}
              onAdd={addEvent}
              onDelete={deleteEvent}
            />
          </div>
        )}

        {/* ── Timeline view ──────────────────────────────────────── */}
        {view === "timeline" && (
          <div className="animate-fade-in">
            <TimelineView
              projects={data.projects}
              viewRange={timelineRange}
              onViewRangeChange={setTimelineRange}
            />
          </div>
        )}

        {/* ── Today view ─────────────────────────────────────────── */}
        {view === "today" && (
          <div className="animate-fade-in">
            <TodayView
              projects={data.projects}
              onToggleTodo={toggleTodo}
            />
          </div>
        )}
      </main>

      {/* Add project modal */}
      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onSave={addProject}
        />
      )}
    </div>
  );
}
