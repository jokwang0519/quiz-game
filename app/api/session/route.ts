import { NextRequest, NextResponse } from "next/server";

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

// 글로벌 인메모리 세션 저장소
const globalStore = global as typeof globalThis & { sessions?: Map<string, SessionState> };
if (!globalStore.sessions) globalStore.sessions = new Map();
const sessions = globalStore.sessions;

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role");

  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const session = sessions.get(code);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (role === "student") {
    return NextResponse.json({
      phase: session.phase,
      totalQuizzes: session.quizzes.length,
      allQuizzes: session.quizzes.map(q => ({ id: q.id, question: q.question, options: q.options })),
      students: Object.keys(session.students).map(name => ({
        name,
        score: session.students[name].score,
      })),
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
    sessions.set(code, newSession);
    return NextResponse.json({ code });
  }

  const { code } = body;
  const session = sessions.get(code);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (action === "join") {
    const { name, characterId } = body;
    if (!session.students[name]) {
      session.students[name] = { name, score: 0, characterId: characterId ?? 1, answers: {}, currentPosition: null };
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "start") {
    session.currentQuizIndex = 0;
    session.phase = "quiz";
    return NextResponse.json({ ok: true });
  }

  if (action === "showResult") {
    session.phase = "result";
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
    return NextResponse.json({ ok: true, correct, correctAnswer: quiz?.answer ?? -1 });
  }

  if (action === "position") {
    const { name, position } = body;
    const student = session.students[name];
    if (student) student.currentPosition = position ?? null;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
