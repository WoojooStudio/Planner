import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const { text, projects = [] } = body as {
    text: string;
    projects: { id: string; name: string }[];
  };

  const projectList = projects.length
    ? projects.map((p) => `- ${p.name} (id: ${p.id})`).join("\n")
    : "- (프로젝트 없음)";

  const systemPrompt = `당신은 생산성 앱의 AI 어시스턴트입니다.
사용자가 자유롭게 쏟아낸 텍스트를 분석해서 할일 목록으로 정리해 주세요.

현재 프로젝트 목록:
${projectList}

반드시 JSON만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.
형식:
{
  "items": [
    {
      "text": "할일 내용",
      "projectId": "해당 프로젝트 id 또는 null",
      "projectName": "해당 프로젝트 이름 또는 null",
      "importance": "high|mid|low",
      "estimateMin": 예상시간(분, 숫자 또는 null)
    }
  ]
}

규칙:
- 각 할일은 하나의 구체적인 행동이어야 함
- 애매한 표현은 명확한 행동으로 바꿔서 작성
- 중요도: 마감이 촉박하거나 중요한 것=high, 일반=mid, 나중에=low
- 기존 프로젝트와 관련 있으면 projectId 연결, 없으면 null
- 한국어로 작성`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response" }, { status: 500 });
    }

    // Parse JSON — strip markdown fences if present
    let raw = textBlock.text.trim();
    raw = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
