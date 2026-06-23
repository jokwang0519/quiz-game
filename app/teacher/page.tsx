"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  question: string;
  options: string[];
  answer: number;
};

type SessionState = {
  roomCode: string;
  quizzes: Quiz[];
  currentQuizIndex: number;
  students: Record<string, { name: string; score: number; answers: Record<string, number> }>;
  phase: "waiting" | "quiz" | "result" | "finished";
};

type Step = "topic" | "preview" | "session";

export default function TeacherPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [code, setCode] = useState("");

  // AI 문제 생성
  const generateQuiz = async () => {
    if (!topic.trim()) return alert("주제를 입력해주세요.");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: questionCount }),
      });
      const data = await res.json();
      if (data.quizzes && data.quizzes.length > 0) {
        setQuizzes(data.quizzes);
        setStep("preview");
      } else {
        alert(`문제 생성에 실패했어요.\n${data.error ?? ""}\n\n다시 시도해주세요.`);
      }
    } catch (e) {
      alert(`네트워크 오류가 발생했어요.\n${String(e)}\n\n다시 시도해주세요.`);
    } finally {
      setGenerating(false);
    }
  };

  const setAnswer = (qi: number, ai: number) => {
    setQuizzes(prev => prev.map((q, i) => i === qi ? { ...q, answer: ai } : q));
  };

  // 세션 생성
  const createSession = async () => {
    const filled = quizzes.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    if (filled.length === 0) return alert("퀴즈가 없어요.");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", quizzes: filled }),
    });
    const data = await res.json();
    setCode(data.code);
    setStep("session");
  };

  // 폴링
  const fetchSession = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/session?code=${code}`);
    if (res.ok) setSession(await res.json());
  }, [code]);

  useEffect(() => {
    if (step !== "session") return;
    fetchSession();
    const t = setInterval(fetchSession, 500);
    return () => clearInterval(t);
  }, [step, fetchSession]);

  const action = async (act: string) => {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act, code }),
    });
    fetchSession();
  };

  // ── 1단계: 주제 입력 ──
  if (step === "topic") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🧙‍♀️</div>
          <h1 className="text-2xl font-bold text-orange-500 mb-2">AI 퀴즈 생성기</h1>
          <p className="text-gray-400 text-sm mb-8">주제를 입력하면 AI가 퀴즈 5문제를 자동으로 만들어줘요!</p>

          <input
            className="w-full border-2 border-orange-200 focus:border-orange-400 outline-none rounded-2xl px-5 py-4 text-lg text-center mb-3"
            placeholder="예) 한국 역사, 동물, 우주, 수학..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateQuiz()}
            autoFocus
          />

          {/* 문제 수 선택 */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">📝 문제 수</p>
            <div className="flex gap-2 justify-center">
              {[3, 5, 10, 15, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                    questionCount === n
                      ? "bg-orange-400 border-orange-400 text-white shadow"
                      : "bg-white border-orange-200 text-orange-400 hover:border-orange-400"
                  }`}
                >
                  {n}문제
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuiz}
            disabled={generating}
            className="w-full py-4 bg-orange-400 hover:bg-orange-500 disabled:bg-orange-200 text-white text-lg font-bold rounded-2xl shadow transition-all"
          >
            {generating ? "🤖 문제 생성 중..." : `✨ ${questionCount}문제 자동 생성`}
          </button>

          {generating && (
            <p className="text-orange-300 text-sm mt-4 animate-pulse">AI가 열심히 문제를 만들고 있어요 잠시만요...</p>
          )}
        </div>
      </main>
    );
  }

  // ── 2단계: 생성된 문제 미리보기 / 정답 확인 ──
  if (step === "preview") {
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("topic")} className="text-gray-400 hover:text-gray-600">← 다시 생성</button>
            <h1 className="text-2xl font-bold text-orange-500">📝 생성된 문제 확인</h1>
            <span className="ml-auto bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm font-bold">주제: {topic}</span>
          </div>

          {quizzes.map((q, qi) => {
            const BG_NAMES = ["quiz_bg.png","quiz_bg2.png","quiz_bg3.png","quiz_bg4.png","quiz_bg5.png"];
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-400 text-white text-sm font-bold px-3 py-1 rounded-full">문제 {qi + 1}</span>
                  <span className="text-xs text-gray-400">배경: {BG_NAMES[qi % 5]}</span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-4">{q.question}</p>
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswer(qi, oi)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${q.answer === oi ? "border-green-400 bg-green-50 text-green-700 font-bold" : "border-gray-200 hover:border-orange-300"}`}
                    >
                      <span className="text-gray-400 mr-1">{oi + 1}.</span> {opt}
                      {q.answer === oi && <span className="ml-1 text-green-500">✓ 정답</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={createSession}
            className="w-full py-4 bg-orange-400 hover:bg-orange-500 text-white text-xl font-bold rounded-2xl shadow mt-2"
          >
            🚀 퀴즈 세션 시작
          </button>
        </div>
      </main>
    );
  }

  // 세션 진행 화면
  if (!session) return <div className="p-8 text-center">로딩중...</div>;

  const currentQuiz = session.currentQuizIndex >= 0 && session.currentQuizIndex < session.quizzes.length
    ? session.quizzes[session.currentQuizIndex]
    : null;
  const studentList = Object.values(session.students).sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">👩‍🏫 선생님 화면</h1>
          <div className="bg-orange-400 text-white px-4 py-2 rounded-xl font-mono font-bold text-xl tracking-widest shadow">
            {session.roomCode}
          </div>
        </div>

        {/* 참가자 */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h2 className="font-bold text-gray-600 mb-2">참가자 ({studentList.length}명)</h2>
          <div className="flex flex-wrap gap-2">
            {studentList.length === 0
              ? <span className="text-gray-400 text-sm">아직 참가자가 없어요</span>
              : studentList.map(s => (
                <span key={s.name} className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
                  {s.name} ({s.score}점)
                </span>
              ))}
          </div>
        </div>

        {/* 현재 상태 */}
        <div className="bg-white rounded-2xl shadow p-5">
          {session.phase === "waiting" && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-2">학생들이 방 코드로 접속하길 기다리는 중...</p>
              <p className="text-4xl font-mono font-bold text-orange-400 mb-6">{session.roomCode}</p>
              <button onClick={() => action("start")} className="px-8 py-4 bg-orange-400 hover:bg-orange-500 text-white text-xl font-bold rounded-2xl shadow">
                ▶ 퀴즈 시작
              </button>
            </div>
          )}

          {session.phase === "quiz" && currentQuiz && (
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>문제 {session.currentQuizIndex + 1} / {session.quizzes.length}</span>
                <span>답변: {Object.values(session.students).filter(s => s.answers[currentQuiz.id] !== undefined).length} / {studentList.length}</span>
              </div>
              <p className="text-xl font-bold mb-4">{currentQuiz.question}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {currentQuiz.options.map((opt, i) => (
                  <div key={i} className={`p-3 rounded-xl border-2 ${currentQuiz.answer === i ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                    <span className="font-bold text-gray-500 mr-2">{i + 1}.</span>{opt}
                    {currentQuiz.answer === i && <span className="ml-1 text-green-500 text-xs">✓ 정답</span>}
                  </div>
                ))}
              </div>
              <button onClick={() => action("showResult")} className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-2xl shadow">
                📊 결과 보기
              </button>
            </div>
          )}

          {session.phase === "result" && currentQuiz && (
            <div>
              <p className="font-bold text-lg mb-3">📊 {currentQuiz.question} — 결과</p>
              {currentQuiz.options.map((opt, i) => {
                const count = Object.values(session.students).filter(s => s.answers[currentQuiz.id] === i).length;
                const pct = studentList.length > 0 ? Math.round(count / studentList.length * 100) : 0;
                return (
                  <div key={i} className={`mb-2 p-3 rounded-xl ${i === currentQuiz.answer ? "bg-green-100 border-2 border-green-400" : "bg-gray-50"}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{i + 1}. {opt}{i === currentQuiz.answer ? " ✓" : ""}</span>
                      <span>{count}명 ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i === currentQuiz.answer ? "bg-green-400" : "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={() => action("nextQuiz")} className="w-full mt-4 py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-2xl shadow">
                {session.currentQuizIndex + 1 >= session.quizzes.length ? "🏁 결과 마무리" : "▶ 다음 문제"}
              </button>
            </div>
          )}

          {session.phase === "finished" && (
            <div className="text-center py-6">
              <p className="text-3xl font-bold mb-4">🏆 최종 결과</p>
              {studentList.map((s, i) => (
                <div key={s.name} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {s.name}</span>
                  <span className="font-bold text-orange-500">{s.score} / {session.quizzes.length} 점</span>
                </div>
              ))}
              <button onClick={() => { setStep("topic"); setCode(""); setSession(null); }} className="mt-6 px-6 py-3 bg-orange-400 text-white rounded-2xl font-bold">
                🔄 다시 시작
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
