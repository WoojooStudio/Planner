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
  const [form, setForm] = useState({
    date: "",
    time: "",
    title: "",
    projectId: "",
  });

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

  const getProjectColor = (projectId?: string) =>
    projectId
      ? (projects.find((p) => p.id === projectId)?.color ?? "#6366f1")
      : "#6366f1";

  const weekEvents = weekDates
    .flatMap((d) => {
      const dStr = d.toISOString().split("T")[0];
      return events
        .filter((e) => e.date === dStr)
        .map((e) => ({ ...e, dateObj: d }));
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time ?? "").localeCompare(b.time ?? "");
    });

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2ddd6",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "13px 16px 11px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          이번 주 일정
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            borderRadius: 20,
            border: "1px solid #e2ddd6",
            background: adding ? "#eef2ff" : "transparent",
            color: adding ? "#6366f1" : "#78716c",
            fontSize: 12,
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!adding) {
              e.currentTarget.style.background = "#f8f8f8";
              e.currentTarget.style.color = "#1c1917";
            }
          }}
          onMouseLeave={(e) => {
            if (!adding) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#78716c";
            }
          }}
          aria-expanded={adding}
          aria-label="일정 추가"
        >
          <Plus size={13} />
          추가
        </button>
      </div>

      {/* Week strip */}
      <div style={{ padding: "12px 12px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 3,
            marginBottom: 12,
          }}
        >
          {weekDates.map((d) => {
            const dStr = d.toISOString().split("T")[0];
            const isToday = dStr === todayStr;
            const dayEvents = events.filter((e) => e.date === dStr);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            return (
              <div
                key={dStr}
                style={{
                  textAlign: "center",
                  padding: "7px 2px",
                  borderRadius: 8,
                  background: isToday ? "#eef2ff" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: isToday ? "#6366f1" : isWeekend ? "#a8a29e" : "#78716c",
                    fontWeight: isToday ? 700 : 500,
                    marginBottom: 3,
                  }}
                >
                  {DAYS[d.getDay()]}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? "#6366f1" : isWeekend ? "#a8a29e" : "#1c1917",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {d.getDate()}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    minHeight: 6,
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Event list */}
      <div style={{ padding: "0 8px 10px" }}>
        {weekEvents.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "#c4bdb5",
              fontSize: 12,
              padding: "8px 0 4px",
              margin: 0,
            }}
          >
            이번 주 일정이 없어요
          </p>
        )}
        {weekEvents.map((e) => {
          const isToday = e.date === todayStr;
          return (
            <div
              key={e.id}
              className="interactive-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 8px",
                borderRadius: 8,
                background: isToday ? "#eef2ff" : "transparent",
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 28,
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
                    lineHeight: 1.3,
                  }}
                >
                  {e.title}
                </div>
                <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 1 }}>
                  {DAYS[e.dateObj.getDay()]}요일
                  {e.time ? ` · ${e.time}` : ""}
                </div>
              </div>
              <button
                onClick={() => onDelete(e.id)}
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
                aria-label={`${e.title} 삭제`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {adding && (
        <div
          className="animate-slide-up"
          style={{
            margin: "0 10px 12px",
            padding: "12px",
            background: "#f8f8f8",
            borderRadius: 10,
            border: "1px solid #e2ddd6",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: "#78716c", fontWeight: 600 }}>날짜 *</span>
            <input
              autoFocus
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: "#78716c", fontWeight: 600 }}>시간</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: "#78716c", fontWeight: 600 }}>일정 이름 *</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="일정 이름"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: "#78716c", fontWeight: 600 }}>프로젝트</span>
            <select
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              style={inputStyle}
            >
              <option value="">프로젝트 없음</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <button
              onClick={handleAdd}
              disabled={!form.date || !form.title.trim()}
              style={{
                flex: 1,
                padding: "9px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                transition: "background-color 0.15s ease, opacity 0.15s ease",
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
              onClick={() => setAdding(false)}
              style={{
                flex: 1,
                padding: "9px",
                background: "#f0f0f0",
                color: "#78716c",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
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
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 12,
  border: "1px solid #e2ddd6",
  borderRadius: 7,
  padding: "8px 10px",
  background: "#fff",
  color: "#1c1917",
  width: "100%",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  outline: "none",
  height: 36,
};
