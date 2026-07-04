import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 외부(Claude 등)에서 투두/인박스 아이템을 추가하는 엔드포인트
// POST /api/inbox  { text: "할일 내용", secret: "..." }

const ROW_ID = "hanna";

export async function POST(req: NextRequest) {
  const secret = process.env.INBOX_SECRET;
  const body = await req.json().catch(() => null);

  if (!body?.text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  // 선택적 비밀키 인증
  if (secret && body.secret !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const sb = createClient(url, key);

  // 현재 데이터 로드
  const { data, error } = await sb
    .from("app_data")
    .select("data")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appData = data?.data ?? { projects: [], events: [], inbox: [] };

  // 인박스에 추가
  const newItem = {
    id: crypto.randomUUID(),
    text: String(body.text).trim(),
    createdAt: new Date().toISOString(),
  };

  appData.inbox = [...(appData.inbox ?? []), newItem];

  const { error: upsertErr } = await sb.from("app_data").upsert(
    { id: ROW_ID, data: appData, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: newItem.id });
}
