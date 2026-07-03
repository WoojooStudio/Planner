export type Importance = "high" | "mid" | "low";

export type Subtask = {
  id: string;
  text: string;
  done: boolean;
  estimateMin?: number;
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  due?: string;
  importance?: Importance;
  estimateMin?: number;
  subtasks?: Subtask[];
  plannedFor?: string;
  carryCount?: number;
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  startDate?: string;
  deadline?: string;
  note?: string;
  collapsed: boolean;
  todos: Todo[];
};

export type CalendarEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  projectId?: string;
};

export type Inbox = {
  id: string;
  text: string;
  createdAt: string;
};

export type AppData = {
  projects: Project[];
  events: CalendarEvent[];
  inbox: Inbox[];
};
