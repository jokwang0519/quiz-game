"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-extrabold text-orange-500 mb-2">🎉 퀴즈타임!</h1>
          <p className="text-gray-500 text-lg">선생님과 학생이 함께하는 실시간 퀴즈</p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => router.push("/teacher")}
            className="w-64 py-5 bg-orange-400 hover:bg-orange-500 text-white text-2xl font-bold rounded-3xl shadow-lg transition-all active:scale-95"
          >
            👩‍🏫 선생님
          </button>
          <button
            onClick={() => router.push("/student")}
            className="w-64 py-5 bg-sky-400 hover:bg-sky-500 text-white text-2xl font-bold rounded-3xl shadow-lg transition-all active:scale-95"
          >
            🧒 학생
          </button>
        </div>
      </div>
    </main>
  );
}
