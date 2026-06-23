"use client";
import { useState } from "react";

type Props = {
  id: number;
  size?: number;
  selected?: boolean;
  label?: string;
};

const LABELS: Record<number, string> = {
  1:"경찰관", 2:"간호사", 3:"의사", 4:"소방관", 5:"선생님",
  6:"과학자", 7:"요리사", 8:"우주비행사", 9:"건축가", 10:"가수/연예인",
  11:"축구선수", 12:"음악가", 13:"마법사", 14:"닌자", 15:"해적",
  16:"왕자", 17:"공주", 18:"로봇", 19:"탐험가", 20:"농부"
};

const COLORS = [
  "#4A90D9","#E8A0BF","#5DADE2","#E74C3C","#8E44AD",
  "#00BCD4","#F39C12","#FF5722","#27AE60","#E91E63",
  "#2ECC71","#9B59B6","#673AB7","#212121","#795548",
  "#F1C40F","#FF69B4","#607D8B","#FF5722","#5D8A3C"
];

function Fallback({ id, size }: { id: number; size: number }) {
  const color = COLORS[(id - 1) % COLORS.length];
  const label = LABELS[id] ?? `캐릭터 ${id}`;
  return (
    <div style={{
      width: size, height: size,
      backgroundColor: color,
      borderRadius: size * 0.2,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: "bold", fontSize: size * 0.3,
    }}>
      {label.slice(0, 1)}
    </div>
  );
}

export default function CharacterAvatar({ id, size = 100, selected = false, label }: Props) {
  const [imgError, setImgError] = useState(false);
  const displayLabel = label ?? LABELS[id] ?? `캐릭터 ${id}`;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: size, height: size,
        borderRadius: size * 0.2,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 8px rgba(0,0,0,0.10)`,
        transition: "box-shadow 0.2s, transform 0.15s",
        transform: selected ? "scale(1.08)" : "scale(1)",
        background: "#f8f9ff",
      }}>
        {!imgError ? (
          <img
            src={`/characters/char_${id}.png`}
            alt={displayLabel}
            width={size}
            height={size}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Fallback id={id} size={size} />
        )}
      </div>
      <span style={{ fontSize: Math.max(10, size * 0.13), color: "#6B7280", fontWeight: 600 }}>
        {displayLabel}
      </span>
    </div>
  );
}
