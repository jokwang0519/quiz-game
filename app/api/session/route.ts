import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export type Quiz = {
  id: string;
  question: string;
  options: string[];
  answer: number;
};

export type Student = {
  name: string;
  score: number;
  characterId: number;
  answers: Record<string, number>;
  currentPosition: number | null;
};

type SessionState = {
  roomCode: string;
  quizzes: Quiz[];
  currentQuizIndex: number;
  students: Record<string, Student>;
  phase: "waiting" | "quiz" | "result" | "finished";
};

async function getSession(code: string): Promise<SessionState | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("data")
    .eq("code", code)
    .single();
  if (error || !data) return null;
  return data.data as SessionState;
}

async function saveSession(code: string, session: SessionState) {
  await supabase
    .from("sessions")
    .upsert({ code, data: session, updated_at: new Date().toISOString() });
}

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role");

  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const session = await getSession(code);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (role === "student") {
    const characterIds: Record<string, number> = {};
    const currentPositions: Record<string, number | null> = {};
    const quizAnswers: Record<string, Record<string, number>> = {};
    for (const [sName, st] of Object.entries(session.students)) {
      characterIds[sName] = st.characterId;
      currentPositions[sName] = st.currentPosition ?? null;
      for (const [qid, chosen] of Object.entries(st.answers)) {
        if (!quizAnswers[qid]) quizAnswers[qid] = {};
        quizAnswers[qid][sName] = chosen;
      }
    }
    return NextResponse.json({
      phase: session.phase,
      totalQuizzes: session.quizzes.length,
      allQuizzes: session.quizzes.map(q => ({ id: q.id, question: q.question, options: q.options })),
      students: Object.keys(session.students).map(sName => ({
        name: sName,
        score: session.students[sName].score,
      })),
      characterIds,
      currentPositions,
      quizAnswers,
    });
  }

  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const code = generateCode();
    const newSession: SessionState = {
      roomCode: code,
      quizzes: body.quizzes || [],
      currentQuizIndex: -1,
      students: {},
      phase: "waiting",
    };
    await saveSession(code, newSession);
    return NextResponse.json({ code });
  }

  const { code } = body;
  const session = await getSession(code);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (action === "join") {
    const { name, characterId } = body;
    if (!session.students[name]) {
      session.students[name] = { name, score: 0, characterId: characterId ?? 1, answers: {}, currentPosition: null };
    }
    await saveSession(code, session);
    return NextResponse.json({ ok: true });
  }

  if (action === "start") {
    session.currentQuizIndex = 0;
    session.phase = "quiz";
    await saveSession(code, session);
    return NextResponse.json({ ok: true });
  }

  if (action === "showResult") {
    session.phase = "result";
    await saveSession(code, session);
    return NextResponse.json({
      ok: true,
      answer: session.quizzes[session.currentQuizIndex]?.answer,
    });
  }

  if (action === "nextQuiz") {
    session.currentQuizIndex += 1;
    if (session.currentQuizIndex >= session.quizzes.length) {
      session.phase = "finished";
    } else {
      session.phase = "quiz";
    }
    await saveSession(code, session);
    return NextResponse.json({ ok: true });
  }

  if (action === "answer") {
    const { name, quizId, chosen } = body;
    const student = session.students[name];
    if (!student) return NextResponse.json({ error: "student not found" }, { status: 404 });
    if (student.answers[quizId] !== undefined) {
      return NextResponse.json({ ok: true, alreadyAnswered: true });
    }
    student.answers[quizId] = chosen;
    const quiz = session.quizzes.find(q => q.id === quizId);
    const correct = quiz ? quiz.answer === chosen : false;
    if (correct) student.score += 1;
    await saveSession(code, session);
    return NextResponse.json({ ok: true, correct, correctAnswer: quiz?.answer ?? -1 });
  }

  if (action === "position") {
    const { name, position } = body;
    const student = session.students[name];
    if (student) student.currentPosition = position ?? null;
    await saveSession(code, session);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
