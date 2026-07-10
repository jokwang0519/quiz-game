"use client";
import { useState, useEffect, useRef } from "react";
import CharacterAvatar from "./CharacterAvatar";

type Props = {
  onConfirm: (characterId: number, name: string) => void;
};

const TOTAL = 10;
const COLS = 5;

const LABELS: Record<number, string> = {
  1:"경찰관", 2:"간호사", 3:"의사", 4:"소방관", 5:"선생님",
  6:"과학자", 7:"요리사", 8:"우주비행사", 9:"건축가", 10:"가수/연예인",
};

export default function ProfileSelect({ onConfirm }: Props) {
  const [selected, setSelected] = useState(1);
  const [name, setName] = useState("");
  const [step, setStep] = useState<"pick" | "name">("pick");
  const nameRef = useRef<HTMLInputElement>(null);

  // 걷기 애니메이션 상태
  const [walkKey, setWalkKey] = useState(0);
  const [walkDir, setWalkDir] = useState<"left" | "right" | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const prevSelected = useRef(1);
  const walkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeSelected = (newId: number) => {
    if (newId === selected) return;
    const dir = newId > prevSelected.current ? "right" : "left";
    setWalkDir(dir);
    setIsWalking(true);
    setWalkKey(k => k + 1);
    prevSelected.current = newId;
    setSelected(newId);
    if (walkTimeout.current) clearTimeout(walkTimeout.current);
    walkTimeout.current = setTimeout(() => setIsWalking(false), 600);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === "pick") {
        if (e.key === "ArrowRight") changeSelected(Math.min(selected + 1, TOTAL));
        else if (e.key === "ArrowLeft") changeSelected(Math.max(selected - 1, 1));
        else if (e.key === "ArrowDown") { const n = selected + COLS; if (n <= TOTAL) changeSelected(n); }
        else if (e.key === "ArrowUp") { const n = selected - COLS; if (n >= 1) changeSelected(n); }
        else if (e.key === "Enter") setStep("name");
      } else if (step === "name") {
        if (e.key === "Escape") setStep("pick");
        else if (e.key === "Enter") handleConfirmKey();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, name, selected]);

  useEffect(() => {
    if (step === "name") setTimeout(() => nameRef.current?.focus(), 50);
  }, [step]);

  const handleConfirmKey = () => {
    if (!name.trim()) return;
    onConfirm(selected, name.trim());
  };

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(selected, name.trim());
  };

  // 걷기 CSS 애니메이션
  const walkStyle = isWalking && walkDir ? {
    animation: `walk-${walkDir} 0.55s cubic-bezier(.22,.68,0,1.1) both`,
  } : {};

  return (
    <>
      <style>{`
        @keyframes walk-right {
          0%   { transform: translateX(-60px) translateY(0px) scaleX(-1); opacity: 0.5; }
          15%  { transform: translateX(-40px) translateY(-10px) scaleX(-1); opacity: 1; }
          30%  { transform: translateX(-20px) translateY(0px) scaleX(-1); }
          45%  { transform: translateX(-8px) translateY(-8px) scaleX(-1); }
          60%  { transform: translateX(0px) translateY(0px) scaleX(-1); }
          75%  { transform: translateX(0px) translateY(-4px) scaleX(1); }
          100% { transform: translateX(0px) translateY(0px) scaleX(1); }
        }
        @keyframes walk-left {
          0%   { transform: translateX(60px) translateY(0px) scaleX(1); opacity: 0.5; }
          15%  { transform: translateX(40px) translateY(-10px) scaleX(1); opacity: 1; }
          30%  { transform: translateX(20px) translateY(0px) scaleX(1); }
          45%  { transform: translateX(8px) translateY(-8px) scaleX(1); }
          60%  { transform: translateX(0px) translateY(0px) scaleX(1); }
          75%  { transform: translateX(0px) translateY(-4px) scaleX(-1); }
          100% { transform: translateX(0px) translateY(0px) scaleX(-1); }
        }
        @keyframes leg-swing {
          0%, 100% { transform: rotate(-18deg); }
          50%       { transform: rotate(18deg); }
        }
        @keyframes arm-swing {
          0%, 100% { transform: rotate(14deg); }
          50%       { transform: rotate(-14deg); }
        }
        @keyframes body-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex flex-col items-center justify-center p-4">

        <h1 className="font-extrabold mb-2 drop-shadow text-center" style={{
          fontSize: "2.8rem",
          background: "linear-gradient(90deg, #FF3CAC, #FF6B35, #FFD700, #4FC3F7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          🎉 재미있는 역사 퀴즈 풀이시간!
        </h1>

        {step === "pick" && (
          <>
            <h2 className="text-2xl font-extrabold text-sky-500 mb-1">캐릭터를 선택해요!</h2>
            <p className="text-gray-400 text-sm mb-5">방향키 ← → 또는 클릭으로 선택 · Enter로 확인</p>

            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map(id => (
                <button
                  key={id}
                  onClick={() => { changeSelected(id); setStep("name"); }}
                  onMouseEnter={() => changeSelected(id)}
                  className={`rounded-2xl p-2 transition-all duration-150 outline-none bg-white flex items-center justify-center
                    ${selected === id
                      ? "border-4 border-sky-400 scale-110 shadow-xl"
                      : "border-2 border-transparent hover:border-sky-200 hover:scale-105 shadow"
                    }`}
                >
                  <CharacterAvatar id={id} size={90} />
                </button>
              ))}
            </div>

            {/* 걷기 프리뷰 */}
            <div className="mt-5 flex items-center gap-4 bg-white rounded-2xl shadow-lg px-6 py-3" style={{ overflow: "hidden", minWidth: 280 }}>
              {/* 걷는 캐릭터 + 다리 스윙 */}
              <div style={{ position: "relative", width: 80, height: 90, flexShrink: 0 }}>
                {/* 캐릭터 몸체 — 걷기 이동 애니메이션 */}
                <div
                  key={walkKey}
                  style={{
                    position: "absolute", inset: 0,
                    ...walkStyle,
                  }}
                >
                  {/* 몸 업다운 */}
                  <div style={{
                    animation: isWalking ? "body-bob 0.18s ease-in-out infinite" : "none",
                    width: "100%", height: "80%",
                  }}>
                    <img
                      src={`/characters/char_${selected}.png`}
                      alt={LABELS[selected]}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                  </div>
                  {/* 다리 1 */}
                  <div style={{
                    position: "absolute", bottom: 0, left: "30%",
                    width: 10, height: 18,
                    background: "#888",
                    borderRadius: 4,
                    transformOrigin: "top center",
                    animation: isWalking ? "leg-swing 0.18s ease-in-out infinite" : "none",
                  }} />
                  {/* 다리 2 (반대 위상) */}
                  <div style={{
                    position: "absolute", bottom: 0, left: "55%",
                    width: 10, height: 18,
                    background: "#666",
                    borderRadius: 4,
                    transformOrigin: "top center",
                    animation: isWalking ? "leg-swing 0.18s 0.09s ease-in-out infinite" : "none",
                  }} />
                </div>
              </div>

              {/* 발자국 트랙 */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
                  {isWalking && ["👣","✨","💨"].map((e, i) => (
                    <span key={i} style={{
                      fontSize: 16, opacity: 0,
                      animation: `fade-step 0.5s ${i * 0.12}s ease forwards`,
                    }}>{e}</span>
                  ))}
                </div>
                <p className="font-bold text-sky-600 text-lg">{LABELS[selected]}</p>
                <p className="text-gray-400 text-sm">Enter 또는 클릭으로 선택</p>
              </div>

              <button
                onClick={() => setStep("name")}
                className="ml-2 px-5 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-bold shadow"
              >
                선택 ▶
              </button>
            </div>

            <style>{`
              @keyframes fade-step {
                0%   { opacity: 0; transform: translateY(4px); }
                40%  { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-4px); }
              }
            `}</style>
          </>
        )}

        {step === "name" && (
          <>
            <h2 className="text-2xl font-extrabold text-sky-500 mb-1">캐릭터를 선택해요!</h2>
            <p className="text-gray-400 text-sm mb-5">이름 입력 후 Tab으로 버튼 이동 · ESC로 이전으로</p>
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
              <div className="flex justify-center mb-2">
                <CharacterAvatar id={selected} size={110} />
              </div>
              <p className="text-sky-500 font-bold text-lg mb-4">{LABELS[selected]}</p>
              <input
                ref={nameRef}
                className="w-full border-2 border-sky-200 focus:border-sky-400 rounded-xl px-4 py-3 text-xl text-center outline-none mb-4"
                style={{ color: "#111111" }}
                placeholder="내 이름을 입력해요"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && name.trim()) handleConfirm(); }}
                maxLength={10}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("pick")}
                  className="flex-1 py-3 border-2 border-sky-200 text-sky-400 rounded-xl font-bold hover:bg-sky-50 cursor-pointer"
                >
                  ← 다시 선택
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!name.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow transition-all
                    ${name.trim() ? "bg-sky-400 hover:bg-sky-500 active:scale-95 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  완료! 🚪
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
