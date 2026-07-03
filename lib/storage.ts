import { getSupabase } from "./supabase";
import type { AppData } from "./types";

const ROW_ID = "hanna";
const LOCAL_KEY = "woojoo_mission_v2";

function getEmpty(): AppData {
  return { projects: [], events: [], inbox: [] };
}

function localLoad(): AppData {
  if (typeof window === "undefined") return getEmpty();
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as AppData) : getEmpty();
  } catch {
    return getEmpty();
  }
}

function localSave(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

export async function loadData(): Promise<AppData> {
  const sb = getSupabase();
  if (!sb) return localLoad();

  try {
    const { data, error } = await sb
      .from("app_data")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      // Supabase에 데이터 없음 → 로컬 데이터 있으면 마이그레이션
      const local = localLoad();
      if (local.projects.length > 0) await saveData(local);
      return local;
    }
    return data.data as AppData;
  } catch {
    return localLoad();
  }
}

export async function saveData(appData: AppData): Promise<void> {
  localSave(appData); // 항상 로컬 백업

  const sb = getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb.from("app_data").upsert(
      { id: ROW_ID, data: appData, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    if (error) throw error;
  } catch {
    // 오프라인 or 오류 → 로컬에 저장됐으니 무시
  }
}
