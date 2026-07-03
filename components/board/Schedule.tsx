"use client";

import type { CalendarEvent, Project } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  events: CalendarEvent[];
  projects: Project[];
  onAdd: (e: Omit<CalendarEvent, "id">) => void;
  onDelete: (id: string) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getWeekDates(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Schedule({ events, projects, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", title: "", projectId: "" });

  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().split("T")[0];

  const handleAdd = () => {
    if (!form.date || !form.title.trim()) return;
    onAdd({
      date: form.date,
      time: form.time || undefined,
      title: form.title.trim(),
      projectId: form.projectId || undefined,
    });
    setForm({ date: "", time: "", title: "", projectId: "" });
    setAdding(false);
  };

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return "#6366f1";
    return projects.find((p) => p.id === projectId)?.color ?? "#6366f1";
  };

  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 16,
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "#78716c", letterSpacing: 0.5 }}>
          이번 주 일정
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6366f1",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
          }}
        >
          <Plus size={14} />
          추가
        </button>
      </div>

      {/* Week strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 12,
        }}
      >
        {weekDates.map((d) => {
          const dStr = d.toISOString().split("T")[0];
          const isToday = dStr === todayStr;
          const dayEvents = events.filter((e) => e.date === dStr);
          return (
            <div
              key={dStr}
              style={{
                textAlign: "center",
                padding: "6px 2px",
                borderRadius: 8,
                background: isToday ? "#eef2ff" : "transparent",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: isToday ? "#6366f1" : "#a8a29e",
                  fontWeight: isToday ? 700 : 400,
                  marginBottom: 3,
                }}
              >
                {DAYS[d.getDay()]}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: isToday ? 800 : 500,
                  color: isToday ? "#6366f1" : "#1c1917",
                }}
              >
                {d.getDate()}
              </div>
              {dayEvents.length > 0 && (
                <div
                  style={{
                    marginTop: 3,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: getProjectColor(e.projectId),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event list for week */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weekDates
          .flatMap((d) => {
            const dStr = d.toISOString().split("T")[0];
            return events
              .filter((e) => e.date === dStr)
              .map((e) => ({ ...e, dateObj: d }));
          })
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return (a.time ?? "").localeCompare(b.time ?? "");
          })
          .map((e) => {
            const isToday = e.date === todayStr;
            return (
              <div
                key={e.id}
                className="group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: isToday ? "#eef2ff" : "#f5f3ef",
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 30,
                    borderRadius: 2,
                    background: getProjectColor(e.projectId),
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1c1917",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#a8a29e" }}>
                    {DAYS[e.dateObj.getDay()]}요일
                    {e.time ? ` ${e.time}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(e.id)}
                  style={{
                    opacity: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#c4bdb5",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="group-hover:opacity-100"
                  aria-label="삭제"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
      </div>

      {/* Add form */}
      {adding && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 10,
            padding: "12px",
            background: "#f5f3ef",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            autoFocus
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            style={{
              fontSize: 12,
              border: "1px solid #e2ddd6",
              borderRadius: 6,
              padding: "6px 10px",
              background: "#fff",
              color: "#1c1917",
            }}
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            style={{
              fontSize: 12,
              border: "1px solid #e2ddd6",
              borderRadius: 6,
              padding: "6px 10px",
              background: "#fff",
              color: "#1c1917",
            }}
          />
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="일정 이름"
            style={{
              fontSize: 12,
              border: "1px solid #e2ddd6",
              borderRadius: 6,
              padding: "6px 10px",
              background: "#fff",
              color: "#1c1917",
            }}
          />
          <select
            value={form.projectId}
            onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            style={{
              fontSize: 12,
              border: "1px solid #e2ddd6",
              borderRadius: 6,
              padding: "6px 10px",
              background: "#fff",
              color: "#1c1917",
            }}
          >
            <option value="">프로젝트 없음</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                padding: "7px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              추가
            </button>
            <button
              onClick={() => setAdding(false)}
              style={{
                flex: 1,
                padding: "7px",
                background: "#e2ddd6",
                color: "#78716c",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
