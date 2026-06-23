import { NextRequest, NextResponse } from "next/server";

export type Quiz = {
  id: string;
  question: string;
  options: string[];
  answer: number; // index
};

export type Student = {
  name: string;
  score: number;
  characterId: number;
  answers: Record<string, number>;      // quizId -> chosen index
  currentPosition: number | null;       // 현재 커서/호버 위치 (0~3), null=없음
};

type SessionState = {
  roomCode: string;
  quizzes: Quiz[];
  currentQuizIndex: number; // -1: 대기중, 0~: 진행중, quizzes.length: 종료
  students: Record<string, Student>; // name -> Student
  phase: "waiting" | "quiz" | "result" | "finished";
};

// 메모리 기반 세션 저장소
const sessions: Record<string, SessionState> = {};

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role");

  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const session = sessions[code];
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  // 학생용: 전체 문제 목록 반환 (정답 숨김) + 현재 phase + 실시간 답변 현황
  if (role === "student") {
    // quizId -> { studentName -> chosenIndex }
    const quizAnswers: Record<string, Record<string, number>> = {};
    const characterIds: Record<string, number> = {};
    const currentPositions: Record<string, number | null> = {}; // 학생별 현재 커서 위치
    for (const [name, st] of Object.entries(session.students)) {
      characterIds[name] = st.characterId;
      currentPositions[name] = st.currentPosition ?? null;
      for (const [qid, chosen] of Object.entries(st.answers)) {
        if (!quizAnswers[qid]) quizAnswers[qid] = {};
        quizAnswers[qid][name] = chosen;
      }
    }
    return NextResponse.json({
      phase: session.phase,
      totalQuizzes: session.quizzes.length,
      allQuizzes: session.quizzes.map(q => ({ id: q.id, question: q.question, options: q.options })),
      students: Object.keys(session.students).map(name => ({
        name,
        score: session.students[name].score,
      })),
      characterIds,
      quizAnswers,
      currentPositions,
    });
  }

  // 선생님용: 전체 반환
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // 세션 생성
  if (action === "create") {
    const code = generateCode();
    sessions[code] = {
      roomCode: code,
      quizzes: body.quizzes || [],
      currentQuizIndex: -1,
      students: {},
      phase: "waiting",
    };
    return NextResponse.json({ code });
  }

  const { code } = body;
  const session = sessions[code];
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  // 학생 참가
  if (action === "join") {
    const { name, characterId } = body;
    if (!session.students[name]) {
      session.students[name] = { name, score: 0, characterId: characterId ?? 1, answers: {}, currentPosition: null };
    }
    return NextResponse.json({ ok: true });
  }

  // 퀴즈 시작
  if (action === "start") {
    session.currentQuizIndex = 0;
    session.phase = "quiz";
    return NextResponse.json({ ok: true });
  }

  // 다음 퀴즈
  if (action === "next") {
    session.currentQuizIndex += 1;
    if (session.currentQuizIndex >= session.quizzes.length) {
      session.phase = "finished";
    }
    return NextResponse.json({ ok: true });
  }

  // 결과 보기 (현재 퀴즈)
  if (action === "showResult") {
    session.phase = "result";
    return NextResponse.json({
      ok: true,
      answer: session.quizzes[session.currentQuizIndex]?.answer,
    });
  }

  // 다음 문제로 (result -> quiz)
  if (action === "nextQuiz") {
    session.currentQuizIndex += 1;
    if (session.currentQuizIndex >= session.quizzes.length) {
      session.phase = "finished";
    } else {
      session.phase = "quiz";
    }
    return NextResponse.json({ ok: true });
  }

  // 커서/호버 위치 업데이트
  if (action === "position") {
    const { name, position } = body; // position: 0~3 or null
    const student = session.students[name];
    if (student) student.currentPosition = position ?? null;
    return NextResponse.json({ ok: true });
  }

  // 학생 답변 제출
  if (action === "answer") {
    const { name, quizId, chosen } = body;
    const student = session.students[name];
    if (!student) return NextResponse.json({ error: "student not found" }, { status: 404 });
    if (student.answers[quizId] !== undefined) {
      return NextResponse.json({ ok: true, alreadyAnswered: true });
    }
    student.answers[quizId] = chosen;
    student.currentPosition = null; // 확정 시 커서 위치 초기화
    const quiz = session.quizzes.find(q => q.id === quizId);
    const correct = quiz ? quiz.answer === chosen : false;
    if (correct) student.score += 1;
    return NextResponse.json({ ok: true, correct, correctAnswer: quiz?.answer ?? -1 });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
