import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null; // SSR에서 사용 안 함
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // 환경변수 없으면 localStorage fallback

  _client = createClient(url, key);
  return _client;
}
