"use client";

import { useState, useRef, useEffect } from "react";
import type { Inbox, Project } from "@/lib/types";
import { Plus, Trash2, ArrowRight } from "lucide-react";

type Props = {
  inbox: Inbox[];
  projects: Project[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onAssign: (inboxId: string, projectId: string, text: string) => void;
};

export default function InboxCapture({ inbox, projects, onAdd, onDelete, onAssign }: Props) {
  const [text, setText] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e2ddd6",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Quick capture input */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: inbox.length > 0 ? "1px solid #efefeb" : "none",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6366f1",
            letterSpacing: 0.5,
            flexShrink: 0,
          }}
        >
          빠른 캡처
        </div>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="생각나는 것 즉시 기록... (Enter)"
          style={{
            flex: 1,
            fontSize: 13,
            border: "none",
            background: "transparent",
            color: "#1c1917",
            outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            background: "#6366f1",
            border: "none",
            borderRadius: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="추가"
        >
          <Plus size={16} color="#fff" />
        </button>
      </div>

      {/* Inbox items */}
      {inbox.length > 0 && (
        <div style={{ padding: "6px 6px 8px" }}>
          {inbox.map((item) => (
            <div key={item.id}>
              <div
                className="group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 10px",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#c4bdb5",
                    flexShrink: 0,
                  }}
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
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() =>
                      setAssigningId(assigningId === item.id ? null : item.id)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6366f1",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="프로젝트에 배정"
                    aria-label="프로젝트에 배정"
                  >
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#c4bdb5",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label="삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Project assignment panel */}
              {assigningId === item.id && (
                <div
                  className="animate-fade-in"
                  style={{
                    margin: "0 10px 6px 24px",
                    padding: "8px",
                    background: "#f5f3ef",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 10, color: "#a8a29e", marginBottom: 2 }}>
                    프로젝트 선택
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onAssign(item.id, p.id, item.text);
                        setAssigningId(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "none",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#1c1917",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: p.color,
                          flexShrink: 0,
                        }}
                      />
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {inbox.length === 0 && (
        <div
          style={{
            padding: "6px 14px 10px",
            fontSize: 11,
            color: "#c4bdb5",
          }}
        >
          인박스가 비어있어요
        </div>
      )}
    </div>
  );
}
