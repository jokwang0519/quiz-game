import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

function extractJson(text: string): object[] | null {
  // thinking 토큰(<think>...</think>) 제거
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  for (const src of [cleaned, text]) {
    const match = src.match(/\[[\s\S]*\]/);
    if (!match) continue;
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      try {
        const fixed = match[0].replace(/,\s*([}\]])/g, "$1");
        const parsed = JSON.parse(fixed);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* 다음 후보 */ }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, count = 5 } = body;
  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });
  const n = Math.max(1, Math.min(30, Number(count)));

  const prompt = `초등학생을 위한 "${topic}" 관련 퀴즈 ${n}문제를 JSON 배열로만 출력하세요.
설명, 마크다운, 코드블록 없이 순수 JSON 배열만 출력하세요.

[
  {
    "question": "문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "answer": 0
  }
]

- answer는 정답 보기의 인덱스 (0~3)
- 초등학생 수준의 쉬운 문제
- 반드시 ${n}문제 모두 "${topic}" 주제로 서로 다른 내용
- JSON 배열만 출력 (${n}개 항목)`;

  let lastError = "";

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.7 },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`[${modelName}] 응답:`, text.slice(0, 300));

      const parsed = extractJson(text);
      if (!parsed) {
        lastError = `${modelName}: JSON 파싱 실패. 원문: ${text.slice(0, 200)}`;
        console.error(lastError);
        continue;
      }

      const quizzes = (parsed as { question: string; options: string[]; answer: number }[])
        .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === "number")
        .map((q, i) => ({
          id: String(Date.now() + i),
          question: q.question,
          options: q.options,
          answer: Math.max(0, Math.min(3, q.answer)),
        }));

      if (quizzes.length === 0) {
        lastError = `${modelName}: 유효한 문제 없음`;
        continue;
      }

      console.log(`[${modelName}] 성공: ${quizzes.length}문제`);
      return NextResponse.json({ quizzes });

    } catch (e) {
      lastError = `${modelName} 오류: ${String(e)}`;
      console.error(lastError);
    }
  }

  return NextResponse.json(
    { error: "문제 생성 실패. 잠시 후 다시 시도해주세요.", detail: lastError },
    { status: 500 }
  );
}
