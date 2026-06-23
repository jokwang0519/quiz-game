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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === "pick") {
        if (e.key === "ArrowRight") setSelected(s => s < TOTAL ? s + 1 : 1);
        else if (e.key === "ArrowLeft") setSelected(s => s > 1 ? s - 1 : TOTAL);
        else if (e.key === "ArrowDown") setSelected(s => s + COLS <= TOTAL ? s + COLS : s);
        else if (e.key === "ArrowUp") setSelected(s => s - COLS >= 1 ? s - COLS : s);
        else if (e.key === "Enter") setStep("name");
      } else if (step === "name") {
        if (e.key === "Escape") setStep("pick");
        else if (e.key === "Enter") handleConfirmKey();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, name]);

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

  return (
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
          <p className="text-gray-400 text-sm mb-5">방향키 ← → ↑ ↓ 또는 클릭으로 선택 · Enter로 확인</p>

          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {Array.from({ length: TOTAL }, (_, i) => i + 1).map(id => (
              <button
                key={id}
                onClick={() => { setSelected(id); setStep("name"); }}
                onMouseEnter={() => setSelected(id)}
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

          <div className="mt-5 flex items-center gap-4 bg-white rounded-2xl shadow-lg px-6 py-3">
            <CharacterAvatar id={selected} size={64} />
            <div>
              <p className="font-bold text-sky-600 text-lg">{LABELS[selected]}</p>
              <p className="text-gray-400 text-sm">Enter 또는 클릭으로 선택</p>
            </div>
            <button
              onClick={() => setStep("name")}
              className="ml-4 px-5 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-bold shadow"
            >
              선택 ▶
            </button>
          </div>
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
  );
}
