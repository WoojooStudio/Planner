"use client";

import { useState, useRef, useEffect } from "react";
import type { Inbox, Project } from "@/lib/types";
import { Plus, Trash2, ArrowRight, Inbox as InboxIcon } from "lucide-react";

type Props = {
  inbox: Inbox[];
  projects: Project[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onAssign: (inboxId: string, projectId: string, text: string) => void;
};

export default function InboxCapture({
  inbox,
  projects,
  onAdd,
  onDelete,
  onAssign,
}: Props) {
  const [text, setText] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1.5px solid ${focused ? "#6366f1" : "#e2ddd6"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
      }}
    >
      {/* Quick capture input */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: inbox.length > 0 ? "1px solid #f0f0f0" : "none",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <InboxIcon
          size={15}
          color={focused ? "#6366f1" : "#a8a29e"}
          style={{ flexShrink: 0, transition: "color 0.15s ease" }}
          aria-hidden="true"
        />
        <label htmlFor="inbox-input" className="sr-only">
          빠른 캡처
        </label>
        <input
          id="inbox-input"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="생각나는 것 즉시 기록… (Enter)"
          autoComplete="off"
          style={{
            flex: 1,
            fontSize: 13,
            border: "none",
            background: "transparent",
            color: "#1c1917",
            outline: "none",
            lineHeight: 1.5,
          }}
          aria-label="빠른 캡처 입력"
        />
        {text.trim() && (
          <button
            onClick={handleAdd}
            className="animate-fade-in-scale"
            style={{
              background: "#6366f1",
              border: "none",
              borderRadius: 7,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#4f52d9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#6366f1")
            }
            aria-label="인박스에 추가"
          >
            <Plus size={15} color="#fff" />
          </button>
        )}
      </div>

      {/* Inbox items */}
      {inbox.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: "4px 6px 8px" }}>
          {inbox.map((item, i) => (
            <li key={item.id}>
              <div
                className="interactive-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#c4bdb5",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "#1c1917",
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </span>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {/* Assign button */}
                  <button
                    onClick={() =>
                      setAssigningId(assigningId === item.id ? null : item.id)
                    }
                    style={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        assigningId === item.id ? "#eef2ff" : "none",
                      border: "none",
                      borderRadius: 6,
                      color:
                        assigningId === item.id ? "#6366f1" : "#a8a29e",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (assigningId !== item.id) {
                        e.currentTarget.style.color = "#6366f1";
                        e.currentTarget.style.background = "#eef2ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (assigningId !== item.id) {
                        e.currentTarget.style.color = "#a8a29e";
                        e.currentTarget.style.background = "none";
                      }
                    }}
                    aria-label={`${item.text} 프로젝트에 배정`}
                    aria-expanded={assigningId === item.id}
                  >
                    <ArrowRight size={13} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="row-action"
                    style={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "none",
                      border: "none",
                      borderRadius: 6,
                      color: "#c4bdb5",
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
                    aria-label={`${item.text} 삭제`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Project assignment panel */}
              {assigningId === item.id && (
                <div
                  className="animate-slide-up"
                  role="menu"
                  aria-label="프로젝트 선택"
                  style={{
                    margin: "2px 10px 6px 22px",
                    padding: "8px",
                    background: "#f8f8f8",
                    borderRadius: 9,
                    border: "1px solid #e2ddd6",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#a8a29e",
                      fontWeight: 600,
                      marginBottom: 2,
                      letterSpacing: 0.4,
                    }}
                  >
                    프로젝트 선택
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onAssign(item.id, p.id, item.text);
                        setAssigningId(null);
                      }}
                      role="menuitem"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 9px",
                        borderRadius: 7,
                        border: "none",
                        background: "#fff",
                        fontSize: 12,
                        color: "#1c1917",
                        textAlign: "left",
                        width: "100%",
                        transition: "background-color 0.12s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8f8f8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: p.color,
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
