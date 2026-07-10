"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ProfileSelect from "@/components/ProfileSelect";
import CharacterAvatar from "@/components/CharacterAvatar";

type QuizItem = { id: string; question: string; options: string[] };
type ServerSession = {
  phase: "waiting" | "quiz" | "result" | "finished";
  totalQuizzes: number;
  allQuizzes: QuizItem[];
  students: { name: string; score: number }[];
  characterIds: Record<string, number>;
  quizAnswers: Record<string, Record<string, number>>; // quizId -> { name -> chosenIdx }
  currentPositions: Record<string, number | null>;     // 학생별 현재 커서 위치
};
type Step = "profile" | "join" | "lobby" | "quiz" | "done" | "finished";

const OPTION_CONFIG = [
  { color: "#e8a838", border: "#c8881a" },
  { color: "#5ba4c8", border: "#3a84a8" },
  { color: "#5aaa88", border: "#3a8a68" },
  { color: "#9b7acc", border: "#7b5aac" },
];


const DECO_ITEMS = ["👾","🐲","💀","🗡️","🎯","💫","🌟","⚡","🔮","🎪","👻","🦄","🌈","🎭","🏰","🗺️"];

export default function StudentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [characterId, setCharacterId] = useState(1);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  // 서버 세션 (phase, students 확인용)
  const [serverSession, setServerSession] = useState<ServerSession | null>(null);
  // 로컬 퀴즈 진행
  const [allQuizzes, setAllQuizzes] = useState<QuizItem[]>([]);
  const [localIndex, setLocalIndex] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);   // 키보드 커서 (미선택)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null); // 마우스 호버
  const [chosen, setChosen] = useState<number | null>(null);   // 확정 선택
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 서버 폴링: phase, students 업데이트
  const fetchSession = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/session?code=${code}&role=student`);
    if (!res.ok) return;
    const data: ServerSession = await res.json();
    setServerSession(data);

    if (data.phase === "finished") {
      setStep("finished");
    } else if (data.phase === "quiz" && step === "lobby") {
      // 선생님이 퀴즈 시작하면 로컬 진행 시작
      setAllQuizzes(data.allQuizzes);
      setLocalIndex(0);
      setCursor(null);
      setHoverIdx(null);
      setChosen(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setCorrectAnswer(null);
      setTimer(0);
      setStep("quiz");
    }
  }, [code, step]);

  useEffect(() => {
    if (step === "profile" || step === "join") return;
    if (step === "done") return; // 완료 후 더 이상 폴링 불필요
    fetchSession();
    const t = setInterval(fetchSession, 500);
    return () => clearInterval(t);
  }, [step, fetchSession]);

  // 타이머
  useEffect(() => {
    if (step === "quiz") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, localIndex]);

  const handleProfileConfirm = (charId: number, playerName: string) => {
    setCharacterId(charId);
    setName(playerName);
    setStep("join");
  };

  const join = async () => {
    if (!code.trim()) return alert("방 코드를 입력해주세요.");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", code: code.toUpperCase(), name, characterId }),
    });
    if (!res.ok) return alert("방을 찾을 수 없어요. 코드를 확인해주세요.");
    setCode(code.toUpperCase());
    setStep("lobby");
  };

  // 커서/호버 위치를 서버에 전송 (debounce 200ms)
  const sendPosition = (position: number | null) => {
    if (!code || !name) return;
    if (positionDebounceRef.current) clearTimeout(positionDebounceRef.current);
    positionDebounceRef.current = setTimeout(() => {
      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "position", code, name, position }),
      }).catch(() => {});
    }, 50);
  };

  // 답 확정 → 서버 전송 → 정답/오답 피드백
  const confirmChoice = async (i: number) => {
    if (chosen !== null || !allQuizzes[localIndex]) return; // 이미 선택함
    setChosen(i);
    sendPosition(null); // 확정 시 커서 위치 즉시 초기화
    const quiz = allQuizzes[localIndex];
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "answer", code, name, quizId: quiz.id, chosen: i }),
    });
    const data = await res.json();
    setIsCorrect(data.correct ?? false);
    setCorrectAnswer(data.correctAnswer ?? -1);
    setShowFeedback(true);
  };

  // 다음 문제로 이동
  const advance = () => {
    const nextIndex = localIndex + 1;
    if (nextIndex >= allQuizzes.length) {
      setStep("done");
    } else {
      setLocalIndex(nextIndex);
      setCursor(null);
      setHoverIdx(null);
      setChosen(null);
      setShowFeedback(false);
      setIsCorrect(null);
      setCorrectAnswer(null);
      setTimer(0);
    }
  };

  // 호버/커서 위치 변경 시 서버에 전송
  useEffect(() => {
    if (step !== "quiz" || chosen !== null) return;
    const pos = hoverIdx !== null ? hoverIdx : cursor;
    sendPosition(pos);
  }, [hoverIdx, cursor, step, chosen]);

  // 2x2 그리드 방향키 이동
  // 배치: 0(좌상) 1(우상) / 2(좌하) 3(우하)
  const moveGrid = (cur: number | null, key: string): number => {
    const c = cur ?? 0;
    if (key === "ArrowRight") return c % 2 === 0 ? c + 1 : c; // 우측이 없으면 유지
    if (key === "ArrowLeft")  return c % 2 === 1 ? c - 1 : c; // 좌측이 없으면 유지
    if (key === "ArrowDown")  return c < 2 ? c + 2 : c;        // 아래가 없으면 유지
    if (key === "ArrowUp")    return c >= 2 ? c - 2 : c;        // 위가 없으면 유지
    return c;
  };

  // 키보드: 방향키 = 커서 이동, 엔터 = 확정/다음
  useEffect(() => {
    if (step !== "quiz") return;
    const handler = (e: KeyboardEvent) => {
      if (["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key)) {
        e.preventDefault();
        if (chosen !== null) return;
        setCursor(c => {
          const next = moveGrid(c, e.key);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (showFeedback) {
          advance();
        } else if (cursor !== null && chosen === null) {
          confirmChoice(cursor);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, cursor, chosen, showFeedback, localIndex, allQuizzes]);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const currentStudentScore = serverSession?.students.find(s => s.name === name)?.score ?? myScore;

  // 배경 이미지 실제 렌더 크기 추적
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<{left:number;top:number;w:number;h:number}|null>(null);
  const calcImgRect = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const cw = img.clientWidth, ch = img.clientHeight;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const rw = iw * scale, rh = ih * scale;
    setImgRect({ left: (cw - rw) / 2, top: (ch - rh) / 2, w: rw, h: rh });
  }, []);
  useEffect(() => {
    window.addEventListener("resize", calcImgRect);
    return () => window.removeEventListener("resize", calcImgRect);
  }, [calcImgRect]);

  // 배경별 스크롤/알약 좌표 (이미지 크기 대비 비율)
  const BG_LAYOUTS = [
    { // 1: 마법사 양피지
      q: { x:0.28, y:0.06, w:0.62, h:0.30 },
      pills: [
        { x:0.20, y:0.42, w:0.38, h:0.16 },
        { x:0.59, y:0.41, w:0.33, h:0.16 },
        { x:0.20, y:0.60, w:0.38, h:0.16 },
        { x:0.59, y:0.60, w:0.33, h:0.16 },
      ],
    },
    { // 2: 우주 강아지
      q: { x:0.44, y:0.03, w:0.51, h:0.37 },
      pills: [
        { x:0.38, y:0.47, w:0.28, h:0.13 },
        { x:0.68, y:0.47, w:0.28, h:0.13 },
        { x:0.38, y:0.62, w:0.28, h:0.13 },
        { x:0.68, y:0.62, w:0.28, h:0.13 },
      ],
    },
    { // 3: 바닷속 펭귄
      q: { x:0.42, y:0.04, w:0.52, h:0.38 },
      pills: [
        { x:0.35, y:0.50, w:0.29, h:0.13 },
        { x:0.66, y:0.50, w:0.29, h:0.13 },
        { x:0.35, y:0.65, w:0.29, h:0.13 },
        { x:0.66, y:0.65, w:0.29, h:0.13 },
      ],
    },
    { // 4: 정글 원숭이
      q: { x:0.41, y:0.02, w:0.52, h:0.35 },
      pills: [
        { x:0.37, y:0.43, w:0.28, h:0.12 },
        { x:0.67, y:0.43, w:0.28, h:0.12 },
        { x:0.37, y:0.57, w:0.28, h:0.12 },
        { x:0.67, y:0.57, w:0.28, h:0.12 },
      ],
    },
    { // 5: 이집트 사막여우
      q: { x:0.40, y:0.03, w:0.55, h:0.40 },
      pills: [
        { x:0.38, y:0.50, w:0.27, h:0.12 },
        { x:0.67, y:0.50, w:0.27, h:0.12 },
        { x:0.38, y:0.65, w:0.27, h:0.12 },
        { x:0.67, y:0.65, w:0.27, h:0.12 },
      ],
    },
  ];

  // ── 프로필 선택 ──
  if (step === "profile") return <ProfileSelect onConfirm={handleProfileConfirm} />;

  // ── 방 코드 입력 ──
  if (step === "join") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5e6c8", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "var(--font-jua), Jua, sans-serif" }}>
        {DECO_ITEMS.slice(0, 12).map((d, i) => (
          <span key={i} style={{ position: "fixed", fontSize: "1.8rem", left: `${(i * 8 + 3) % 92}%`, top: `${(i * 11 + 5) % 90}%`, opacity: 0.12, pointerEvents: "none", animation: `float ${3 + i % 3}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>{d}</span>
        ))}
        <div style={{ background: "rgba(255,248,230,0.95)", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, border: "3px solid #c8a84a", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="float"><CharacterAvatar id={characterId} size={100} /></div>
            <p style={{ fontWeight: 900, color: "#7c3aed", fontSize: 18, marginTop: 8 }}>{name}</p>
            <button onClick={() => setStep("profile")} style={{ fontSize: 12, color: "#999", background: "none", border: "none", cursor: "pointer" }}>캐릭터 바꾸기</button>
          </div>
          <div style={{ background: "#fdf3dc", border: "2px solid #e8c87a", borderRadius: 16, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontWeight: 900, color: "#7c5a1a", fontSize: 18 }}>🔑 방 코드를 입력해요</p>
          </div>
          <input
            style={{ width: "100%", border: "3px solid #c8a84a", borderRadius: 16, padding: "14px 16px", textAlign: "center", fontSize: 32, fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.3em", outline: "none", background: "#fffbf0", boxSizing: "border-box", color: "#3a2a0a", marginBottom: 16 }}
            placeholder="XXXXX" value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={5} onKeyDown={e => e.key === "Enter" && join()} autoFocus
          />
          <button onClick={join} style={{ width: "100%", padding: "16px", background: "linear-gradient(180deg, #f0a030, #c87820)", border: "3px solid #a06010", borderRadius: 20, color: "white", fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 0 #805010", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
            🚪 입장하기!
          </button>
        </div>
      </main>
    );
  }

  // ── 로비 (선생님 대기) ──
  if (step === "lobby") {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "var(--font-jua), Jua, sans-serif" }}>
        {["🌟","✨","💫","⭐","🎉","🎊","🎈","🎀"].map((d, i) => (
          <span key={i} style={{ position: "fixed", fontSize: "2rem", left: `${(i * 12 + 5) % 90}%`, top: `${(i * 13 + 8) % 85}%`, opacity: 0.2, pointerEvents: "none", animation: `float ${3 + i % 3}s ease-in-out infinite` }}>{d}</span>
        ))}
        <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          <div className="float" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><CharacterAvatar id={characterId} size={130} /></div>
          <h2 style={{ color: "white", fontSize: 28, fontWeight: 900, marginBottom: 8, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>선생님을 기다리는 중...</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, marginBottom: 20 }}>안녕하세요, <span style={{ color: "#fde68a", fontWeight: 900 }}>{name}</span>님! 🎉</p>
          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,0.3)" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 12 }}>현재 참가자 <span style={{ color: "#fde68a", fontWeight: 900 }}>{serverSession?.students.length ?? 0}</span>명</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {serverSession?.students.map(s => (
                <span key={s.name} style={{ padding: "6px 14px", borderRadius: 99, fontSize: 14, fontWeight: 700, background: s.name === name ? "#fde68a" : "rgba(255,255,255,0.25)", color: s.name === name ? "#1a1a2e" : "white" }}>{s.name}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── 퀴즈 진행 ──
  if (step === "quiz" && allQuizzes.length > 0) {
    const quiz = allQuizzes[localIndex];

    // 문제 번호별 CSS 테마 (순환)
    const THEMES = [
      { // 0: 밤하늘
        bg: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        accent: "#a78bfa",
        qBox: "rgba(20,15,50,0.82)",
        qBorder: "#7c3aed",
        particles: Array.from({length:18},(_,i)=>({
          top:`${Math.random()*90}%`, left:`${Math.random()*100}%`,
          size: Math.random()*3+2, delay: Math.random()*4, dur: 2+Math.random()*3,
          type:"star"
        })),
        emoji:"🌙", label:"밤하늘",
      },
      { // 1: 바닷속
        bg: "linear-gradient(180deg, #0c4a6e 0%, #0369a1 40%, #164e63 100%)",
        accent: "#38bdf8",
        qBox: "rgba(5,30,60,0.82)",
        qBorder: "#0284c7",
        particles: Array.from({length:14},(_,i)=>({
          top:`${70+Math.random()*30}%`, left:`${Math.random()*100}%`,
          size: Math.random()*16+8, delay: Math.random()*4, dur: 4+Math.random()*4,
          type:"bubble"
        })),
        emoji:"🌊", label:"바닷속",
      },
      { // 2: 마법 숲
        bg: "linear-gradient(180deg, #052e16 0%, #14532d 50%, #166534 100%)",
        accent: "#4ade80",
        qBox: "rgba(5,30,15,0.82)",
        qBorder: "#16a34a",
        particles: Array.from({length:16},(_,i)=>({
          top:`${Math.random()*90}%`, left:`${Math.random()*100}%`,
          size: 6+Math.random()*4, delay: Math.random()*5, dur: 3+Math.random()*4,
          type:"firefly"
        })),
        emoji:"🌿", label:"마법 숲",
      },
      { // 3: 우주
        bg: "linear-gradient(180deg, #000000 0%, #1e0533 50%, #0c0520 100%)",
        accent: "#e879f9",
        qBox: "rgba(10,0,25,0.85)",
        qBorder: "#a855f7",
        particles: Array.from({length:20},(_,i)=>({
          top:`${Math.random()*80}%`, left:`${Math.random()*100}%`,
          size: Math.random()*2+1, delay: Math.random()*6, dur: 1.5+Math.random()*2,
          type:"star"
        })),
        emoji:"🚀", label:"우주",
      },
      { // 4: 노을
        bg: "linear-gradient(180deg, #7c3aed 0%, #db2777 35%, #ea580c 65%, #fbbf24 100%)",
        accent: "#fde68a",
        qBox: "rgba(60,10,10,0.78)",
        qBorder: "#f59e0b",
        particles: Array.from({length:6},(_,i)=>({
          top:`${20+i*10}%`, left:`${i*18}%`,
          size: 40+i*20, delay: i*0.8, dur: 8+i*2,
          type:"cloud"
        })),
        emoji:"🌅", label:"노을",
      },
    ];

    const theme = THEMES[localIndex % THEMES.length];

    return (
      <main style={{
        width: "100vw", height: "100vh",
        display: "flex", flexDirection: "column",
        background: theme.bg,
        fontFamily: "var(--font-jua), Jua, sans-serif",
        overflow: "hidden", position: "relative",
      }}>
        {/* 배경 파티클 */}
        {theme.particles.map((p, pi) => (
          p.type === "star" ? (
            <div key={pi} style={{
              position: "absolute", top: p.top, left: p.left,
              width: p.size, height: p.size,
              borderRadius: "50%", background: "white",
              animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
              pointerEvents: "none", zIndex: 0,
            }} />
          ) : p.type === "bubble" ? (
            <div key={pi} style={{
              position: "absolute", top: p.top, left: p.left,
              width: p.size, height: p.size,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.08)",
              animation: `bubble-rise ${p.dur}s ${p.delay}s ease-in infinite`,
              pointerEvents: "none", zIndex: 0,
            }} />
          ) : p.type === "firefly" ? (
            <div key={pi} style={{
              position: "absolute", top: p.top, left: p.left,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: "#86efac",
              boxShadow: "0 0 8px 4px #4ade8088",
              animation: `firefly ${p.dur}s ${p.delay}s ease-in-out infinite`,
              pointerEvents: "none", zIndex: 0,
            }} />
          ) : p.type === "cloud" ? (
            <div key={pi} style={{
              position: "absolute", top: p.top, left: p.left,
              width: p.size*2.5, height: p.size,
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              animation: `cloud-drift ${p.dur}s ${p.delay}s ease-in-out infinite`,
              pointerEvents: "none", zIndex: 0,
            }} />
          ) : null
        ))}

        {/* 테마 레이블 + 문제 번호 (우상단) */}
        <div style={{
          position: "absolute", top: 14, right: 20, zIndex: 10,
          background: "rgba(0,0,0,0.35)", borderRadius: 20,
          padding: "4px 14px", color: theme.accent, fontSize: "clamp(11px,1vw,15px)", fontWeight: 700,
        }}>{theme.emoji} {localIndex+1}/{allQuizzes.length}</div>

        {/* 플레이어 정보 바 */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", justifyContent: "center", padding: "10px 16px 0",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.55)", borderRadius: 40, backdropFilter: "blur(6px)",
            padding: "6px 18px", display: "flex", alignItems: "center", gap: 10,
            border: `1px solid ${theme.accent}44`,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: `2px solid ${theme.accent}`, flexShrink: 0 }}>
              <img src={`/characters/char_${characterId}.png`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
            </div>
            <span style={{ color: theme.accent, fontSize: "clamp(13px,1.2vw,18px)", fontWeight: 900 }}>{name}</span>
            <span style={{ color: "#fbbf24", fontSize: "clamp(12px,1.1vw,16px)" }}>⭐ {currentStudentScore}점</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <span style={{ color: timer > 30 ? "#f87171" : "#86efac", fontSize: "clamp(12px,1.1vw,16px)" }}>⏱ {fmtTime(timer)}</span>
          </div>
        </div>

        {/* 문제 박스 */}
        <div style={{ flex: "0 0 auto", padding: "10px 24px 6px", position: "relative", zIndex: 10 }}>
          <div
            key={localIndex}
            className="question-in"
            style={{
              background: theme.qBox,
              border: `2px solid ${theme.qBorder}`,
              borderRadius: 20,
              padding: "18px 28px",
              backdropFilter: "blur(8px)",
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
              textAlign: "center",
            }}>
            <p style={{
              fontSize: "clamp(18px, 2.6vw, 38px)",
              color: "white",
              lineHeight: 1.5, margin: 0,
              fontWeight: 900,
              textShadow: `0 2px 8px rgba(0,0,0,0.6)`,
              wordBreak: "keep-all",
            }}>{quiz.question}</p>
          </div>
        </div>

        {/* 보기 2×2 그리드 */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "clamp(8px,1.2vw,16px)",
          padding: "6px 20px 14px",
          position: "relative", zIndex: 10,
        }}>
          {quiz.options.map((opt, i) => {
            const p = { x:0, y:0, w:1, h:1 }; // 더 이상 절대 좌표 불필요
            const cfg = OPTION_CONFIG[i];
            const isHover  = hoverIdx === i && chosen === null;  // 마우스 호버
            const isCursor = cursor === i && chosen === null && hoverIdx === null; // 키보드 커서
            const isActive = isHover || isCursor;               // 호버 or 커서 (미확정)
            const isChosen = chosen === i;                      // 확정 선택
            const isCorrectPill = showFeedback && correctAnswer === i;
            const isWrongPill = showFeedback && isChosen && !isCorrect;
            const EMOJIS = ["🍎","💎","🧭","🪄"];
            const slideClass = [`slide-up-1`,`slide-up-2`,`slide-up-3`,`slide-up-4`][i];

            // 확정 답변 목록 (서버)
            const serverAnswers = serverSession?.quizAnswers?.[quiz.id] ?? {};
            // 현재 커서/호버 위치 목록 (서버 + 내 위치)
            const serverPositions = serverSession?.currentPositions ?? {};
            const myActiveIdx = chosen !== null ? chosen : (hoverIdx !== null ? hoverIdx : cursor);
            const mergedPositions: Record<string, number> = {};
            // 다른 학생 커서 위치
            for (const [sName, pos] of Object.entries(serverPositions)) {
              if (sName !== name && pos !== null) mergedPositions[sName] = pos;
            }
            // 내 위치 (로컬 즉시 반영)
            if (myActiveIdx !== null) mergedPositions[name] = myActiveIdx;

            // 이 보기(i)에 있는 학생 목록 구성
            // confirmed: 확정 제출한 학생 (진한 표시)
            // hovering: 커서만 올린 학생 (반투명)
            const confirmedHere = Object.entries(serverAnswers)
              .filter(([, idx]) => idx === i)
              .map(([sName]) => ({ sName, charId: sName === name ? characterId : (serverSession?.characterIds?.[sName] ?? 1), confirmed: true }));
            const hoveringHere = Object.entries(mergedPositions)
              .filter(([sName, pos]) => pos === i && !(sName in serverAnswers))
              .map(([sName]) => ({ sName, charId: sName === name ? characterId : (serverSession?.characterIds?.[sName] ?? 1), confirmed: false }));
            const choosersOfThis = [...confirmedHere, ...hoveringHere];
            // ── 선택 상태별 스타일 ──
            // 기본: 흰색 배경 + 컬러 테두리
            // 호버/커서: 흰색 유지 + 굵은 테두리 + 왼쪽 컬러 띠 강조
            // 확정 선택: 좌측 컬러 블록(40%) + 우측 흰색(60%) 분할 레이아웃
            // 정답: 초록 블록, 오답: 빨간 블록
            const pillBg = isWrongPill ? "#ef4444"
              : isCorrectPill ? "#22c55e"
              : isChosen ? cfg.color
              : "rgba(255,252,240,0.97)";
            const pillBorder = isWrongPill ? "4px solid #b91c1c"
              : isCorrectPill ? "4px solid #15803d"
              : isChosen ? `4px solid ${cfg.border}`
              : isActive ? `5px solid ${cfg.color}`
              : `3px solid ${cfg.color}88`;
            const pillShadow = isChosen
              ? `0 8px 0 ${cfg.border}, 0 12px 28px rgba(0,0,0,0.32)`
              : isActive
              ? `0 6px 0 ${cfg.color}99, 0 8px 20px rgba(0,0,0,0.22)`
              : `0 4px 0 ${cfg.color}44, 0 5px 14px rgba(0,0,0,0.10)`;

            // 프로필 2행 그리드: 최대 10개 표시(행당 5), 나머지 +N
            const MAX_SHOW = 10;
            const shown = choosersOfThis.slice(0, MAX_SHOW);
            const overflow = choosersOfThis.length - MAX_SHOW;
            const avatarSize = "clamp(36px,3.6vw,52px)";

            return (
              <button
                key={i}
                onClick={() => { if (chosen === null) confirmChoice(i); }}
                onMouseEnter={() => { if (chosen === null) { setHoverIdx(i); setCursor(null); sendPosition(i); } }}
                onMouseLeave={() => { if (chosen === null) { setHoverIdx(null); sendPosition(null); } }}
                className={`${isChosen ? "wiggle" : isActive ? "pill-selecting" : ""} ${slideClass}`}
                style={{
                  width: "100%", height: "100%",
                  background: isWrongPill ? "#ef4444"
                    : isCorrectPill ? "#22c55e"
                    : isChosen ? cfg.color
                    : isActive ? cfg.color
                    : "rgba(255,252,240,0.97)",
                  border: isWrongPill ? "6px solid #fff"
                    : isCorrectPill ? "6px solid #fff"
                    : isChosen ? `6px solid white`
                    : isActive ? `5px solid white`
                    : `3px solid ${cfg.color}88`,
                  borderRadius: "999px",
                  cursor: chosen !== null ? "default" : "pointer",
                  display: "flex", alignItems: "stretch",
                  zIndex: isActive ? 30 : 20,
                  transition: isActive ? "none" : "transform 0.15s, background 0.15s, opacity 0.15s",
                  transform: isChosen ? "scale(1.07) translateY(-6px)" : "scale(1)",
                  boxShadow: isActive && !isChosen
                    ? `0 0 0 6px ${cfg.color}, 0 0 0 10px white, 0 20px 50px rgba(0,0,0,0.6)`
                    : isChosen ? `0 0 0 4px ${cfg.border}, 0 12px 28px rgba(0,0,0,0.32)`
                    : pillShadow,
                  overflow: "hidden",
                  position: "relative",
                  opacity: showFeedback && !isChosen && !isCorrectPill ? 0.25
                    : !isActive && !isChosen && !showFeedback && chosen === null && (hoverIdx !== null || cursor !== null) ? 0.5
                    : 1,
                }}
              >
                {/* 왼쪽 컬러 블록: 배지 영역 */}
                <div style={{
                  width: "22%", minWidth: 0,
                  background: isChosen || isWrongPill || isCorrectPill || isActive
                    ? "rgba(0,0,0,0.22)"
                    : cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  borderRadius: "999px 0 0 999px",
                }}>
                  <span style={{ fontSize: "clamp(18px,2vw,30px)" }}>
                    {isWrongPill ? "✗" : isCorrectPill ? "✓" : isChosen ? "✓" : EMOJIS[i]}
                  </span>
                </div>

                {/* 가운데: 텍스트 */}
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 2%",
                }}>
                  <span style={{
                    fontSize: "clamp(15px,2vw,28px)",
                    color: isChosen || isWrongPill || isCorrectPill || isActive ? "white" : "#1a0e00",
                    fontWeight: 900,
                    textShadow: isChosen || isWrongPill || isCorrectPill || isActive ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                    lineHeight: 1.2,
                    textAlign: "center",
                    wordBreak: "keep-all",
                  }}>{opt}</span>
                </div>

                {/* 오른쪽: 프로필 2행 그리드 */}
                <div style={{
                  width: "34%", minWidth: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-end", justifyContent: "center",
                  padding: "4% 4% 4% 2%",
                  gap: "4%",
                  background: isChosen || isWrongPill || isCorrectPill || isActive
                    ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                  borderRadius: "0 999px 999px 0",
                }}>
                  {chosen === null && !showFeedback && choosersOfThis.length === 0 && (
                    <span style={{ fontSize: "clamp(9px,0.9vw,12px)", color: isActive ? "white" : cfg.color, opacity: 0.7 }}>
                      대기중...
                    </span>
                  )}
                  {/* 행 1 */}
                  {shown.length > 0 && (
                    <div style={{ display: "flex", gap: "clamp(2px,0.3vw,4px)", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {shown.slice(0, 5).map(({ sName, charId, confirmed }) => (
                        <div key={sName} title={sName} style={{
                          width: avatarSize, height: avatarSize,
                          borderRadius: "50%", overflow: "hidden",
                          border: confirmed
                            ? "2px solid rgba(255,255,255,0.9)"
                            : "2px dashed rgba(255,255,255,0.7)",
                          background: "#fff",
                          flexShrink: 0,
                          opacity: confirmed ? 1 : 0.8,
                        }}>
                          <img src={`/characters/char_${charId}.png`} alt={sName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 행 2 */}
                  {shown.length > 5 && (
                    <div style={{ display: "flex", gap: "clamp(2px,0.3vw,4px)", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {shown.slice(5, 10).map(({ sName, charId, confirmed }) => (
                        <div key={sName} title={sName} style={{
                          width: avatarSize, height: avatarSize,
                          borderRadius: "50%", overflow: "hidden",
                          border: confirmed
                            ? "2px solid rgba(255,255,255,0.9)"
                            : "2px dashed rgba(255,255,255,0.7)",
                          background: "#fff",
                          flexShrink: 0,
                          opacity: confirmed ? 1 : 0.8,
                        }}>
                          <img src={`/characters/char_${charId}.png`} alt={sName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      ))}
                      {overflow > 0 && (
                        <div style={{
                          width: avatarSize, height: avatarSize,
                          borderRadius: "50%", background: "rgba(0,0,0,0.45)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: "clamp(8px,0.85vw,12px)", fontWeight: 900,
                          flexShrink: 0,
                        }}>+{overflow}</div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 피드백 배너 + 다음 버튼 */}
        {showFeedback && (
          <div style={{
            position: "fixed",
            bottom: 16, left: "50%",
            transform: "translateX(-50%)",
            width: "min(480px, 60vw)",
            zIndex: 50,
            animation: "slide-up 0.35s cubic-bezier(.22,.68,0,1.2) both",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {/* 정답/오답 배너 */}
            <div style={{
              textAlign: "center",
              padding: "10px 20px",
              borderRadius: 16,
              background: isCorrect ? "rgba(34,197,94,0.95)" : "rgba(239,68,68,0.95)",
              color: "white",
              fontSize: "clamp(16px,1.8vw,24px)",
              fontWeight: 900,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}>
              {isCorrect ? "🎉 정답입니다!" : "😅 오답! 다음엔 잘 할 수 있어요"}
            </div>
            <button
              onClick={advance}
              style={{
                width: "100%", padding: "14px 0",
                background: "linear-gradient(180deg,#f0a030,#c87820)",
                border: "2px solid #a06010",
                borderRadius: 20,
                color: "white",
                fontSize: "clamp(14px, 1.6vw, 20px)",
                cursor: "pointer",
                boxShadow: "0 4px 0 #7a4a08, 0 6px 20px rgba(0,0,0,0.35)",
              }}
            >
              {localIndex + 1 < allQuizzes.length ? "✅ 다음 문제로! (Enter)" : "🏁 완료!"}
            </button>
          </div>
        )}
      </main>
    );
  }

  // ── 모든 문제 완료 (선생님 대기) ──
  if (step === "done") {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "var(--font-jua), Jua, sans-serif" }}>
        {["🎊","🎉","🏆","⭐","🌟","👑","💫","🎈"].map((d, i) => (
          <span key={i} style={{ position: "fixed", fontSize: "2rem", left: `${(i * 12 + 5) % 90}%`, top: `${(i * 13 + 8) % 85}%`, opacity: 0.2, pointerEvents: "none", animation: `float ${3 + i % 3}s ease-in-out infinite` }}>{d}</span>
        ))}
        <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          <div className="float bounce-in" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <CharacterAvatar id={characterId} size={130} />
          </div>
          <h2 style={{ color: "#fde68a", fontSize: 32, marginBottom: 8, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>🎉 모든 문제 완료!</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, marginBottom: 4 }}>수고했어요, <span style={{ color: "#fde68a" }}>{name}</span>님!</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20 }}>선생님이 결과를 확인하고 있어요 👀</p>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "16px 32px", border: "1px solid rgba(255,255,255,0.3)" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 4 }}>내 점수</p>
            <p style={{ color: "#fde68a", fontSize: 48, lineHeight: 1 }}>{currentStudentScore}점</p>
          </div>
        </div>
      </main>
    );
  }

  // ── 최종 결과 (선생님이 종료) ──
  if (step === "finished") {
    const sorted = [...(serverSession?.students ?? [])].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(s => s.name === name) + 1;
    return (
      <main style={{ minHeight: "100vh", background: "#f5e6c8", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "var(--font-jua), Jua, sans-serif" }}>
        {["🎊","🎉","🏆","⭐","🌟","👑","💫","🎈"].map((d, i) => (
          <span key={i} style={{ position: "fixed", fontSize: "2rem", left: `${(i * 12 + 5) % 90}%`, top: `${(i * 13 + 8) % 85}%`, opacity: 0.15, pointerEvents: "none", animation: `float ${3 + i % 3}s ease-in-out infinite` }}>{d}</span>
        ))}
        <div style={{ background: "rgba(255,248,220,0.97)", border: "3px solid #c8a84a", borderRadius: 28, padding: 32, width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🎊</div>
          <div className="float" style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><CharacterAvatar id={characterId} size={90} /></div>
          <h2 style={{ color: "#c87820", fontSize: 26, marginBottom: 4 }}>퀴즈 완료!</h2>
          <p style={{ color: "#666", marginBottom: 4 }}><span style={{ color: "#4f46e5" }}>{name}</span>님의 최종 점수</p>
          <p style={{ fontSize: 56, color: "#c87820", lineHeight: 1 }}>{currentStudentScore}점</p>
          {myRank > 0 && <p style={{ fontSize: 28, margin: "8px 0 16px" }}>{myRank === 1 ? "🥇 1등!" : myRank === 2 ? "🥈 2등!" : myRank === 3 ? "🥉 3등!" : `${myRank}위`}</p>}
          <div style={{ textAlign: "left", borderTop: "2px solid #e8d090", paddingTop: 12, marginBottom: 16 }}>
            {sorted.map((s, i) => (
              <div key={s.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: s.name === name ? 900 : 500, color: s.name === name ? "#4f46e5" : "#555", borderBottom: "1px dashed #e8d090" }}>
                <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {s.name}</span>
                <span style={{ color: "#c87820" }}>{s.score}점</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/")} style={{ width: "100%", padding: 14, background: "linear-gradient(180deg, #f0a030, #c87820)", border: "3px solid #a06010", borderRadius: 20, color: "white", fontSize: 18, cursor: "pointer", boxShadow: "0 4px 0 #805010" }}>
            🏠 홈으로
          </button>
        </div>
      </main>
    );
  }

  return null;
}
