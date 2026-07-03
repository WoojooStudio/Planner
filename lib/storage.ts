import type { AppData } from "./types";

const STORAGE_KEY = "woojoo_mission_v2";

export function loadData(): AppData {
  if (typeof window === "undefined") return getEmptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyData();
    return JSON.parse(raw) as AppData;
  } catch {
    return getEmptyData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getEmptyData(): AppData {
  return { projects: [], events: [], inbox: [] };
}
