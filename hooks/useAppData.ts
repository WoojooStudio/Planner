"use client";

import { useState, useEffect, useCallback } from "react";
import { loadData, saveData } from "@/lib/storage";
import { seedData } from "@/lib/seed";
import type {
  AppData,
  Project,
  Todo,
  CalendarEvent,
  Inbox,
} from "@/lib/types";

export function useAppData() {
  const [data, setData] = useState<AppData>({ projects: [], events: [], inbox: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadData();
    if (stored.projects.length === 0) {
      setData(seedData);
    } else {
      setData(stored);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveData(data);
  }, [data, loaded]);

  // carryover: 매 로드 시 plannedFor가 오늘 이전이고 미완료인 할일 → 오늘로 이월
  useEffect(() => {
    if (!loaded) return;
    const today = new Date().toISOString().split("T")[0];
    setData((d) => {
      let changed = false;
      const projects = d.projects.map((p) => {
        const todos = p.todos.map((t) => {
          if (!t.done && t.plannedFor && t.plannedFor < today) {
            changed = true;
            return {
              ...t,
              plannedFor: today,
              carryCount: (t.carryCount ?? 0) + 1,
            };
          }
          return t;
        });
        return { ...p, todos };
      });
      return changed ? { ...d, projects } : d;
    });
  }, [loaded]);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData((d) => updater(d));
  }, []);

  // ── Project mutations ──────────────────────────────────────────────
  const addProject = useCallback(
    (p: Omit<Project, "id" | "collapsed" | "todos">) => {
      update((d) => ({
        ...d,
        projects: [
          ...d.projects,
          { ...p, id: crypto.randomUUID(), collapsed: false, todos: [] },
        ],
      }));
    },
    [update]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    [update]
  );

  const deleteProject = useCallback(
    (id: string) => {
      update((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
    },
    [update]
  );

  // ── Todo mutations ─────────────────────────────────────────────────
  const addTodo = useCallback(
    (projectId: string, todo: Omit<Todo, "id">) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? { ...p, todos: [...p.todos, { ...todo, id: crypto.randomUUID() }] }
            : p
        ),
      }));
    },
    [update]
  );

  const updateTodo = useCallback(
    (projectId: string, todoId: string, patch: Partial<Todo>) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                todos: p.todos.map((t) =>
                  t.id === todoId ? { ...t, ...patch } : t
                ),
              }
            : p
        ),
      }));
    },
    [update]
  );

  const deleteTodo = useCallback(
    (projectId: string, todoId: string) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? { ...p, todos: p.todos.filter((t) => t.id !== todoId) }
            : p
        ),
      }));
    },
    [update]
  );

  const toggleTodo = useCallback(
    (projectId: string, todoId: string) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                todos: p.todos.map((t) =>
                  t.id === todoId ? { ...t, done: !t.done } : t
                ),
              }
            : p
        ),
      }));
    },
    [update]
  );

  // ── Event mutations ────────────────────────────────────────────────
  const addEvent = useCallback(
    (e: Omit<CalendarEvent, "id">) => {
      update((d) => ({
        ...d,
        events: [...d.events, { ...e, id: crypto.randomUUID() }],
      }));
    },
    [update]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    },
    [update]
  );

  // ── Inbox mutations ────────────────────────────────────────────────
  const addInbox = useCallback(
    (text: string) => {
      update((d) => ({
        ...d,
        inbox: [
          ...d.inbox,
          {
            id: crypto.randomUUID(),
            text,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [update]
  );

  const assignInboxToProject = useCallback(
    (inboxId: string, projectId: string, text: string) => {
      update((d) => {
        const today = new Date().toISOString().split("T")[0];
        return {
          ...d,
          inbox: d.inbox.filter((i) => i.id !== inboxId),
          projects: d.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  todos: [
                    ...p.todos,
                    {
                      id: crypto.randomUUID(),
                      text,
                      done: false,
                      plannedFor: today,
                    },
                  ],
                }
              : p
          ),
        };
      });
    },
    [update]
  );

  const deleteInbox = useCallback(
    (id: string) => {
      update((d) => ({ ...d, inbox: d.inbox.filter((i) => i.id !== id) }));
    },
    [update]
  );

  return {
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
  };
}
