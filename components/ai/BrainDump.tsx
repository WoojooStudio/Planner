"use client";

import { useState } from "react";
import type { Project, Todo } from "@/lib/types";
import { Sparkles, X, Check, ChevronRight } from "lucide-react";

type ParsedItem = {
  text: string;
  projectId: string | null;
  projectName: string | null;
  importance: "high" | "mid" | "low";
  estimateMin: number | null;
};

type Props = {
  projects: Project[];
  onAddTodos: (items: { projectId: string | null; todo: Omit<Todo, "id"> }[]) => void;
};

const IMPORTANCE_LABEL = { high: "높음", mid: "보통", low: "낮음" };
const IMPORTANCE_COLOR = { high: "#ef4444", mid: "#f59e0b", low: "#a8a29e" };

export default function BrainDump({ projects, onAddTodos }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setItems([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          projects: projects.map((p) => ({ id: p.id, name: p.name })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "오류가 발생했어요");
        return;
      }

      const parsed: ParsedItem[] = (json.items ?? []).map((item: ParsedItem) => ({
        text: item.text,
        projectId: item.projectId ?? null,
        projectName: item.projectName ?? null,
        importance: item.importance ?? "mid",
        estimateMin: item.estimateMin ?? null,
      }));

      setItems(parsed);
      setSelected(new Set(parsed.map((_, i) => i)));
    } catch {
      setError("연결 오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    const today = new Date().toISOString().split("T")[0];
    const toAdd = items
      .filter((_, i) => selected.has(i))
      .map((item) => ({
        projectId: item.projectId,
        todo: {
          text: item.text,
          done: false,
          importance: item.importance,
          estimateMin: item.estimateMin ?? undefined,
          plannedFor: today,
        } as Omit<Todo, "id">,
      }));

    onAddTodos(toAdd);
    setText("");
    setItems([]);
    setSelected(new Set());
    setOpen(false);
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((_, i) => i)));
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          borderRadius: 20,
          border: "1.5px solid #e2ddd6",
          background: "#ffffff",
          color: "#6366f1",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#eef2ff";
          e.currentTarget.style.borderColor = "#6366f1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#e2ddd6";
        }}
      >
        <Sparkles size={15} />
        AI 브레인덤프
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1.5px solid #6366f1",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 0 0 3px rgba(99,102,241,0.08)",
      }}
      className="animate-fade-in"
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>
            AI 브레인덤프
          </span>
        </div>
        <button
          onClick={() => { setOpen(false); setItems([]); setText(""); setError(""); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", display: "flex", alignItems: "center" }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Input area */}
      {items.length === 0 && (
        <div style={{ padding: "14px 16px" }}>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="지금 머릿속에 있는 것들을 다 쏟아내세요…&#10;&#10;예: 우주 사주 결제 모듈 붙여야 하는데, 비누 인스타그램 포스팅도 해야 하고, 블로그 글 초안 작성, 미팅 준비..."
            rows={5}
            style={{
              width: "100%",
              fontSize: 13,
              border: "1.5px solid #e2ddd6",
              borderRadius: 10,
              padding: "10px 12px",
              background: "#fff",
              color: "#1c1917",
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              marginBottom: 10,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd6")}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>{error}</p>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            style={{
              width: "100%",
              height: 40,
              background: loading || !text.trim() ? "#efefeb" : "#6366f1",
              color: loading || !text.trim() ? "#a8a29e" : "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading || !text.trim() ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              if (!loading && text.trim()) e.currentTarget.style.background = "#4f52d9";
            }}
            onMouseLeave={(e) => {
              if (!loading && text.trim()) e.currentTarget.style.background = "#6366f1";
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                AI가 분류하는 중…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                분류하기
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div>
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: "#78716c" }}>
              {items.length}개 항목 발견 · {selected.size}개 선택됨
            </span>
            <button
              onClick={toggleAll}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6366f1" }}
            >
              {selected.size === items.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {items.map((item, i) => {
              const isSelected = selected.has(i);
              const proj = projects.find((p) => p.id === item.projectId);

              return (
                <div
                  key={i}
                  onClick={() => {
                    const next = new Set(selected);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    setSelected(next);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: isSelected ? "#f5f3ff" : "transparent",
                    borderBottom: "1px solid #f9f9f9",
                    transition: "background 0.1s ease",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: `2px solid ${isSelected ? "#6366f1" : "#c4bdb5"}`,
                      background: isSelected ? "#6366f1" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#1c1917", lineHeight: 1.4, marginBottom: 3 }}>
                      {item.text}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {proj && (
                        <span
                          style={{
                            fontSize: 11,
                            color: proj.color,
                            fontWeight: 500,
                          }}
                        >
                          {proj.emoji} {proj.name}
                        </span>
                      )}
                      {!proj && item.projectName && (
                        <span style={{ fontSize: 11, color: "#a8a29e" }}>
                          📂 {item.projectName}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 10,
                          color: IMPORTANCE_COLOR[item.importance],
                          background: `${IMPORTANCE_COLOR[item.importance]}18`,
                          padding: "1px 5px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {IMPORTANCE_LABEL[item.importance]}
                      </span>
                      {item.estimateMin && (
                        <span style={{ fontSize: 11, color: "#a8a29e" }}>
                          {item.estimateMin}분
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
            <button
              onClick={handleApprove}
              disabled={selected.size === 0}
              style={{
                flex: 1,
                height: 38,
                background: selected.size === 0 ? "#efefeb" : "#6366f1",
                color: selected.size === 0 ? "#a8a29e" : "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: selected.size === 0 ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (selected.size > 0) e.currentTarget.style.background = "#4f52d9";
              }}
              onMouseLeave={(e) => {
                if (selected.size > 0) e.currentTarget.style.background = "#6366f1";
              }}
            >
              {selected.size}개 추가
            </button>
            <button
              onClick={() => { setItems([]); setText(""); setSelected(new Set()); }}
              style={{
                height: 38,
                padding: "0 14px",
                background: "#f0f0f0",
                color: "#78716c",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2ddd6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            >
              다시
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
