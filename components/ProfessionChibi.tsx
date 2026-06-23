"use client";

type Props = { id: number; size?: number; selected?: boolean };

const CX = 60, CY = 50, HR = 34;
const SL = "#FDDCB5", SM = "#F0C27A", SD = "#C8956C";
const SHOE = "#1a1a2e";

function Face({ s = SL, ec = "#1a0a00" }: { s?: string; ec?: string }) {
  return <>
    <circle cx={CX} cy={CY} r={HR} fill={s} />
    <ellipse cx={47} cy={45} rx={7.5} ry={9} fill="white" />
    <circle cx={47} cy={47} r={5.2} fill={ec} />
    <circle cx={49.5} cy={43.5} r={2} fill="white" />
    <ellipse cx={73} cy={45} rx={7.5} ry={9} fill="white" />
    <circle cx={73} cy={47} r={5.2} fill={ec} />
    <circle cx={75.5} cy={43.5} r={2} fill="white" />
    <ellipse cx={36} cy={58} rx={9} ry={5.5} fill="#FFB3C6" opacity=".75" />
    <ellipse cx={84} cy={58} rx={9} ry={5.5} fill="#FFB3C6" opacity=".75" />
    <path d="M52 65 Q60 72 68 65" fill="none" stroke="#e8789a" strokeWidth="2.3" strokeLinecap="round" />
  </>;
}

function Body({ tc, bc = "#374151", s = SL }: { tc: string; bc?: string; s?: string }) {
  return <>
    <rect x={56} y={82} width={8} height={9} fill={s} />
    <rect x={41} y={89} width={38} height={28} fill={tc} rx={6} />
    <rect x={26} y={91} width={16} height={22} fill={tc} rx={6} />
    <rect x={78} y={91} width={16} height={22} fill={tc} rx={6} />
    <circle cx={33} cy={114} r={6} fill={s} />
    <circle cx={87} cy={114} r={6} fill={s} />
    <rect x={45} y={115} width={13} height={22} fill={bc} rx={4} />
    <rect x={62} y={115} width={13} height={22} fill={bc} rx={4} />
    <ellipse cx={51} cy={138} rx={10} ry={5.5} fill={SHOE} />
    <ellipse cx={68} cy={138} rx={10} ry={5.5} fill={SHOE} />
  </>;
}

const LABELS: Record<number, string> = {
  1:"경찰관",2:"간호사",3:"의사",4:"소방관",5:"요리사",
  6:"선생님",7:"우주인",8:"파일럿",9:"농부",10:"화가",
  11:"축구선수",12:"음악가",13:"과학자",14:"마법사",15:"닌자",
  16:"해적",17:"왕자",18:"공주",19:"로봇",20:"탐험가"
};

export default function ProfessionChibi({ id, size = 120, selected = false }: Props) {
  function render() {
    switch (id) {

      case 1: return <> {/* 경찰관 */}
        <ellipse cx={60} cy={41} rx={35} ry={26} fill="#111" />
        <Face />
        <rect x={26} y={21} width={68} height={17} fill="#1E3A5F" rx={4} />
        <rect x={22} y={32} width={76} height={8} fill="#162a47" rx={2} />
        <circle cx={60} cy={27} r={6} fill="#FFD700" />
        <Body tc="#1E3A5F" bc="#162a47" />
        <polygon points="60,93 61.8,98.5 67.5,98.5 63,102 64.8,107.5 60,104 55.2,107.5 57,102 52.5,98.5 58.2,98.5" fill="#FFD700" />
        <rect x={41} y={113} width={38} height={5} fill="#2c1810" rx={2} />
        <rect x={56} y={111} width={8} height={9} fill="#c8a400" rx={2} />
      </>;

      case 2: return <> {/* 간호사 */}
        <ellipse cx={60} cy={43} rx={34} ry={25} fill="#7B3F00" />
        <circle cx={60} cy={20} r={13} fill="#7B3F00" />
        <Face />
        <rect x={35} y={17} width={50} height={15} fill="white" rx={3} />
        <rect x={57} y={19} width={6} height={11} fill="#EF4444" rx={1} />
        <rect x={54} y={23} width={12} height={4} fill="#EF4444" rx={1} />
        <Body tc="white" bc="#FDA4AF" />
        <rect x={57} y={93} width={5} height={14} fill="#EF4444" rx={1} />
        <rect x={53} y={99} width={13} height={4} fill="#EF4444" rx={1} />
        <path d="M29 104 C29 100 25 97 25 100.5 C25 104 29 108 29 108 C29 108 33 104 33 100.5 C33 97 29 100 29 104" fill="#FF6B9D" />
      </>;

      case 3: return <> {/* 의사 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#4a2c0a" />
        <Face />
        <g fill="none" stroke="#555" strokeWidth="2">
          <ellipse cx={47} cy={46} rx={10} ry={11} />
          <ellipse cx={73} cy={46} rx={10} ry={11} />
          <line x1={57} y1={46} x2={63} y2={46} />
          <line x1={37} y1={46} x2={41} y2={46} />
          <line x1={79} y1={46} x2={83} y2={46} />
        </g>
        <Body tc="white" bc="#BFDBFE" />
        <rect x={52} y={87} width={16} height={5} fill="#e0e0e0" rx={2} />
        <path d="M46 99 C46 103 52 106 52 110" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        <circle cx={52} cy={112} r={4.5} fill="#60A5FA" />
        <path d="M74 99 C74 103 68 106 68 110" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        <circle cx={68} cy={112} r={4.5} fill="#60A5FA" />
        <line x1={52} y1={110} x2={68} y2={110} stroke="#60A5FA" strokeWidth="3" />
      </>;

      case 4: return <> {/* 소방관 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#3d2b1f" />
        <Face s={SM} />
        <rect x={27} y={13} width={66} height={24} fill="#DC2626" rx={5} />
        <rect x={23} y={29} width={74} height={9} fill="#991B1B" rx={2} />
        <rect x={38} y={13} width={44} height={8} fill="#FCD34D" rx={2} />
        <ellipse cx={60} cy={14} rx={16} ry={6} fill="#B91C1C" />
        <rect x={54} y={8} width={12} height={8} fill="#DC2626" rx={2} />
        <Body tc="#DC2626" bc="#1F2937" s={SM} />
        <rect x={41} y={96} width={38} height={6} fill="#FCD34D" rx={1} />
        <rect x={41} y={109} width={38} height={6} fill="#FCD34D" rx={1} />
      </>;

      case 5: return <> {/* 요리사 */}
        <ellipse cx={60} cy={43} rx={34} ry={26} fill="#1a0a00" />
        <Face />
        <ellipse cx={60} cy={22} rx={23} ry={18} fill="white" />
        <ellipse cx={60} cy={13} rx={18} ry={13} fill="white" />
        <ellipse cx={60} cy={7} rx={14} ry={10} fill="white" />
        <rect x={37} y={28} width={46} height={10} fill="white" rx={2} />
        <Body tc="white" bc="#374151" />
        <rect x={47} y={89} width={26} height={28} fill="#f0f0f0" rx={3} />
        <circle cx={60} cy={97} r={3} fill="#ccc" />
        <circle cx={60} cy={106} r={3} fill="#ccc" />
        <rect x={81} y={97} width={4} height={18} fill="#aaa" rx={2} />
        <ellipse cx={83} cy={95} rx={5} ry={4} fill="#aaa" />
      </>;

      case 6: return <> {/* 선생님 */}
        <ellipse cx={60} cy={41} rx={35} ry={26} fill="#2d1a0e" />
        <Face s={SM} />
        <g fill="none" stroke="#555" strokeWidth="2.2">
          <rect x={38} y={39} width={18} height={13} rx={6} />
          <rect x={64} y={39} width={18} height={13} rx={6} />
          <line x1={56} y1={45} x2={64} y2={45} />
        </g>
        <Body tc="#4ADE80" bc="#065F46" s={SM} />
        <rect x={78} y={91} width={16} height={22} fill="#4ADE80" rx={6} />
        <rect x={82} y={95} width={8} height={15} fill="#FEF9C3" rx={2} />
        <rect x={83} y={98} width={6} height={1.5} fill="#86EFAC" />
        <rect x={83} y={101} width={6} height={1.5} fill="#86EFAC" />
        <rect x={83} y={104} width={6} height={1.5} fill="#86EFAC" />
        <circle cx={33} cy={105} r={5} fill="#FBBF24" />
        <path d="M30 103 C30 99 36 99 36 103" fill="#22C55E" />
      </>;

      case 7: return <> {/* 우주인 */}
        <circle cx={60} cy={50} r={43} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="4" />
        <circle cx={60} cy={50} r={37} fill="#EFF6FF" />
        <Face ec="#1a3a5c" />
        <rect x={36} y={60} width={48} height={14} fill="#93C5FD" rx={7} opacity=".45" />
        <Body tc="white" bc="#CBD5E1" />
        <rect x={47} y={89} width={26} height={9} fill="#93C5FD" rx={3} />
        <rect x={51} y={92} width={5} height={5} fill="#3B82F6" rx={1} />
        <rect x={64} y={92} width={5} height={5} fill="#EF4444" rx={1} />
        <circle cx={60} cy={102} r={4} fill="#FCD34D" />
        <rect x={26} y={102} width={16} height={7} fill="#93C5FD" rx={3} />
        <rect x={78} y={102} width={16} height={7} fill="#93C5FD" rx={3} />
      </>;

      case 8: return <> {/* 파일럿 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#4a2c0a" />
        <Face s={SM} />
        <rect x={28} y={21} width={64} height={18} fill="#1E3A5F" rx={4} />
        <rect x={24} y={33} width={72} height={8} fill="#162a47" rx={2} />
        <ellipse cx={60} cy={25} rx={14} ry={5} fill="#162a47" />
        <g fill="#FFD700">
          <ellipse cx={60} cy={29} rx={3} ry={2} />
          <path d="M46 29 L55 27 L55 31 Z" />
          <path d="M74 29 L65 27 L65 31 Z" />
          <path d="M40 29 L47 28 L47 30 Z" />
          <path d="M80 29 L73 28 L73 30 Z" />
        </g>
        <Body tc="#1E3A5F" bc="#162a47" s={SM} />
        <path d="M46 92 L51 88 L59 93 L54 97 Z" fill="#FFD700" />
        <rect x={59} y={88} width={3} height={8} fill="#FFD700" />
        <rect x={56} y={91} width={9} height={3} fill="#FFD700" />
      </>;

      case 9: return <> {/* 농부 */}
        <ellipse cx={60} cy={43} rx={34} ry={26} fill="#6B3A2A" />
        <Face s={SM} />
        <ellipse cx={60} cy={23} rx={40} ry={12} fill="#D97706" />
        <ellipse cx={60} cy={19} rx={25} ry={12} fill="#FBBF24" />
        <rect x={35} y={27} width={50} height={9} fill="#B45309" rx={2} />
        <Body tc="#3B82F6" bc="#1D4ED8" s={SM} />
        <rect x={41} y={89} width={38} height={6} fill="#93C5FD" rx={2} />
        <rect x={55} y={86} width={10} height={40} fill="#3B82F6" rx={3} />
        <rect x={82} y={97} width={3} height={20} fill="#D97706" rx={2} />
        <ellipse cx={83} cy={95} rx={6} ry={4} fill="#D97706" />
        <path d="M78 93 C82 88 87 89 83 95" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      </>;

      case 10: return <> {/* 화가 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#7C3AED" />
        <Face />
        <ellipse cx={72} cy={19} rx={17} ry={11} fill="#8B5CF6" />
        <ellipse cx={72} cy={15} rx={13} ry={8} fill="#6D28D9" />
        <Body tc="#FEF9C3" bc="#374151" />
        <rect x={41} y={89} width={38} height={28} fill="white" rx={5} opacity=".85" />
        {(["#EF4444","#3B82F6","#22C55E","#F59E0B","#A855F7"] as string[]).map((c,i) => (
          <circle key={i} cx={46+i*8} cy={96} r={3.5} fill={c} />
        ))}
        <rect x={26} y={97} width={5} height={18} fill="#92400E" rx={2} />
        <ellipse cx={28.5} cy={95} rx={4.5} ry={3.5} fill="#6D28D9" />
        <rect x={79} y={91} width={14} height={11} fill="#FCD34D" rx={3} />
        <circle cx={83} cy={97} r={3.5} fill="#EF4444" />
        <circle cx={89} cy={94} r={3} fill="#3B82F6" />
        <circle cx={89} cy={101} r={3} fill="#22C55E" />
      </>;

      case 11: return <> {/* 축구선수 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#111" />
        <Face s={SD} />
        <Body tc="#EF4444" bc="#1D4ED8" s={SD} />
        <rect x={41} y={89} width={38} height={4} fill="white" rx={1} />
        <rect x={41} y={99} width={38} height={4} fill="white" rx={1} />
        <rect x={41} y={109} width={38} height={4} fill="white" rx={1} />
        <circle cx={86} cy={107} r={9} fill="white" stroke="#111" strokeWidth="1.5" />
        <path d="M86 98 L86 116 M77 107 L95 107" stroke="#111" strokeWidth="1.5" />
        <path d="M80 101 L92 113 M92 101 L80 113" stroke="#111" strokeWidth="1" />
      </>;

      case 12: return <> {/* 음악가 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#F97316" />
        <Face />
        <Body tc="#A855F7" bc="#581C87" />
        <rect x={41} y={89} width={38} height={5} fill="#C084FC" rx={2} />
        <rect x={41} y={108} width={38} height={5} fill="#C084FC" rx={2} />
        <rect x={27} y={91} width={4} height={22} fill="#A855F7" rx={2} />
        <circle cx={29} cy={89} r={6} fill="#FCD34D" />
        <text x={29} y={93} textAnchor="middle" fontSize="9" fill="#581C87" fontWeight="bold">♪</text>
        <rect x={79} y={92} width={5} height={18} fill="#C084FC" rx={2} />
        <ellipse cx={81} cy={108} rx={7} ry={4.5} fill="#FCD34D" />
        <path d="M85 110 L85 119 C85 121 89 121 89 119 L89 112" fill="none" stroke="#FCD34D" strokeWidth="2.2" />
      </>;

      case 13: return <> {/* 과학자 */}
        {([-18,-9,0,9,18] as number[]).map((dx,i) => (
          <ellipse key={i} cx={60+dx} cy={35} rx={7} ry={6} fill="#F59E0B" />
        ))}
        <Face />
        <rect x={35} y={35} width={50} height={16} rx={8} fill="none" stroke="#6B7280" strokeWidth="3" />
        <rect x={35} y={35} width={24} height={16} rx={8} fill="#BFDBFE" opacity=".8" />
        <rect x={61} y={35} width={24} height={16} rx={8} fill="#BFDBFE" opacity=".8" />
        <Body tc="white" bc="#374151" />
        <rect x={52} y={87} width={16} height={5} fill="#e0e0e0" rx={2} />
        <rect x={26} y={91} width={16} height={22} fill="white" rx={6} />
        <rect x={29} y={98} width={5} height={14} fill="#93C5FD" rx={2} />
        <rect x={30} y={93} width={4} height={4} fill="#6EE7B7" rx={1} />
        <rect x={29} y={108} width={8} height={3} fill="#FCA5A5" rx={1} />
      </>;

      case 14: return <> {/* 마법사 */}
        <ellipse cx={60} cy={44} rx={34} ry={26} fill="#EDE9FE" />
        <Face s="#EDE9FE" ec="#4C1D95" />
        <polygon points="60,2 76,38 44,38" fill="#7C3AED" />
        <rect x={36} y={33} width={48} height={11} fill="#6D28D9" rx={3} />
        <circle cx={65} cy={12} r={3.5} fill="#FCD34D" />
        <circle cx={72} cy={22} r={3} fill="#FCD34D" />
        <circle cx={52} cy={16} r={2.5} fill="#FCD34D" />
        <circle cx={58} cy={7} r={2} fill="#A5F3FC" />
        <Body tc="#7C3AED" bc="#4C1D95" s="#EDE9FE" />
        <rect x={41} y={89} width={38} height={5} fill="#A78BFA" rx={2} />
        <rect x={79} y={93} width={4} height={20} fill="#A78BFA" rx={2} />
        <circle cx={81} cy={91} r={5} fill="#FCD34D" />
        <polygon points="81,86 82.5,90 86,90 83.5,92 84.5,96 81,94 77.5,96 78.5,92 76,90 79.5,90" fill="#FCD34D" transform="scale(0.8) translate(20.25,5.75)" />
      </>;

      case 15: return <> {/* 닌자 */}
        <ellipse cx={60} cy={42} rx={35} ry={26} fill="#111" />
        <circle cx={CX} cy={CY} r={HR} fill={SL} />
        <rect x={26} y={45} width={68} height={20} fill="#1F2937" rx={4} />
        <ellipse cx={47} cy={45} rx={7.5} ry={9} fill="white" />
        <circle cx={47} cy={47} r={5.2} fill="#1a0a00" />
        <circle cx={49.5} cy={43.5} r={2} fill="white" />
        <ellipse cx={73} cy={45} rx={7.5} ry={9} fill="white" />
        <circle cx={73} cy={47} r={5.2} fill="#1a0a00" />
        <circle cx={75.5} cy={43.5} r={2} fill="white" />
        <rect x={26} y={28} width={68} height={19} fill="#374151" rx={4} />
        <Body tc="#1F2937" bc="#111827" />
        <polygon points="60,117 62,123 68,123 63.5,126.5 65.5,132 60,128.5 54.5,132 56.5,126.5 52,123 58,123" fill="#9CA3AF" />
        <polygon points="84,97 85.5,101 89.5,101 86.5,103.5 87.5,107.5 84,105.5 80.5,107.5 81.5,103.5 78.5,101 82.5,101" fill="#9CA3AF" transform="scale(0.7) translate(36,37)" />
      </>;

      case 16: return <> {/* 해적 */}
        <ellipse cx={60} cy={43} rx={35} ry={26} fill="#111" />
        <Face />
        <rect x={27} y={19} width={66} height={25} fill="#111" rx={4} />
        <rect x={23} y={36} width={74} height={8} fill="#0a0a0a" rx={2} />
        <circle cx={60} cy={26} r={9} fill="white" />
        <circle cx={57} cy={24} r={2} fill="#111" />
        <circle cx={63} cy={24} r={2} fill="#111" />
        <path d="M56 30 L64 30" stroke="#111" strokeWidth="2" />
        <rect x={33} y={41} width={17} height={15} fill="#111" rx={3} />
        <Body tc="#DC2626" bc="#1F2937" />
        {([0,1,2,3] as number[]).map(i => (
          <rect key={i} x={41} y={91+i*9} width={38} height={4} fill="white" rx={1} />
        ))}
        <rect x={79} y={91} width={15} height={22} fill="#DC2626" rx={6} />
        <rect x={83} y={96} width={4} height={15} fill="#C0C0C0" rx={2} />
        <rect x={80} y={103} width={10} height={3} fill="#C0C0C0" rx={1} />
      </>;

      case 17: return <> {/* 왕자 */}
        <ellipse cx={60} cy={43} rx={34} ry={26} fill="#DAA520" />
        <Face s={SM} ec="#1a3a5c" />
        <polygon points="60,17 50,33 41,21 41,35 79,35 79,21 70,33" fill="#FFD700" />
        <rect x={39} y={32} width={42} height={9} fill="#DAA520" rx={2} />
        <circle cx={50} cy={36} r={3.5} fill="#EF4444" />
        <circle cx={60} cy={36} r={3.5} fill="#60A5FA" />
        <circle cx={70} cy={36} r={3.5} fill="#22C55E" />
        <Body tc="#1E40AF" bc="#1E3A5F" s={SM} />
        <rect x={41} y={89} width={38} height={9} fill="#FFD700" rx={3} />
        <rect x={41} y={98} width={38} height={5} fill="#DAA520" rx={1} />
        <rect x={79} y={91} width={15} height={22} fill="#1E40AF" rx={6} />
        <rect x={83} y={93} width={4} height={18} fill="#FFD700" rx={2} />
        <circle cx={85} cy={91} r={5} fill="#FFD700" />
        <polygon points="85,86 86.5,90 90.5,90 87.5,92.5 88.5,96.5 85,94.5 81.5,96.5 82.5,92.5 79.5,90 83.5,90" fill="#FCD34D" transform="scale(0.75) translate(28,7)" />
      </>;

      case 18: return <> {/* 공주 */}
        {([-18,-9,0,9,18] as number[]).map((dx,i) => (
          <ellipse key={i} cx={60+dx} cy={27} rx={11} ry={9} fill="#F472B6" />
        ))}
        <Face s="#FDE8F0" ec="#9D174D" />
        <polygon points="60,19 52,31 44,19 46,33 74,33 76,19 68,31" fill="#FCD34D" />
        <rect x={45} y={29} width={30} height={7} fill="#FFD700" rx={2} />
        <circle cx={53} cy={33} r={3} fill="#EF4444" />
        <circle cx={60} cy={33} r={3} fill="#60A5FA" />
        <circle cx={67} cy={33} r={3} fill="#A855F7" />
        <rect x={56} y={82} width={8} height={9} fill="#FDE8F0" />
        <path d="M40 89 C34 112 29 132 35 142 C45 147 75 147 85 142 C91 132 86 112 80 89 Z" fill="#FB7185" />
        {([0,1,2,3,4,5] as number[]).map(i => (
          <path key={i} d={`M${42+i*10} 102 Q${47+i*10} 113 ${42+i*10} 124`} fill="none" stroke="#FDA4AF" strokeWidth="1.8" />
        ))}
        <path d="M40 89 L80 89" stroke="#F9A8D4" strokeWidth="2" />
      </>;

      case 19: return <> {/* 로봇 */}
        <rect x={22} y={14} width={76} height={58} fill="#9CA3AF" rx={10} />
        <rect x={26} y={18} width={68} height={50} fill="#D1D5DB" rx={8} />
        <rect x={55} y={8} width={10} height={10} fill="#9CA3AF" rx={3} />
        <circle cx={60} cy={7} r={6} fill="#FCD34D" />
        <rect x={33} y={30} width={24} height={18} rx={5} fill="#60A5FA" opacity=".9" />
        <rect x={63} y={30} width={24} height={18} rx={5} fill="#60A5FA" opacity=".9" />
        <circle cx={45} cy={39} r={6} fill="#BFDBFE" />
        <circle cx={45} cy={39} r={3} fill="#1D4ED8" />
        <circle cx={75} cy={39} r={6} fill="#BFDBFE" />
        <circle cx={75} cy={39} r={3} fill="#1D4ED8" />
        <rect x={40} y={52} width={40} height={9} fill="#6B7280" rx={4} />
        {([0,1,2,3,4] as number[]).map(i => <rect key={i} x={42+i*8} y={54} width={5} height={5} fill="#4B5563" rx={1} />)}
        <rect x={41} y={89} width={38} height={28} fill="#9CA3AF" rx={6} />
        <rect x={26} y={91} width={16} height={22} fill="#9CA3AF" rx={6} />
        <rect x={78} y={91} width={16} height={22} fill="#9CA3AF" rx={6} />
        <circle cx={33} cy={114} r={6} fill="#9CA3AF" />
        <circle cx={87} cy={114} r={6} fill="#9CA3AF" />
        <rect x={45} y={115} width={13} height={22} fill="#6B7280" rx={4} />
        <rect x={62} y={115} width={13} height={22} fill="#6B7280" rx={4} />
        <ellipse cx={51} cy={138} rx={10} ry={5.5} fill="#4B5563" />
        <ellipse cx={68} cy={138} rx={10} ry={5.5} fill="#4B5563" />
        <circle cx={48} cy={97} r={3.5} fill="#EF4444" />
        <circle cx={60} cy={97} r={3.5} fill="#22C55E" />
        <circle cx={72} cy={97} r={3.5} fill="#F59E0B" />
        <rect x={50} y={107} width={20} height={6} fill="#374151" rx={3} />
      </>;

      case 20: return <> {/* 탐험가 */}
        <ellipse cx={60} cy={43} rx={34} ry={26} fill="#7B5804" />
        <Face s={SM} />
        <ellipse cx={60} cy={24} rx={42} ry={12} fill="#D97706" />
        <ellipse cx={60} cy={19} rx={27} ry={12} fill="#FBBF24" />
        <rect x={33} y={28} width={54} height={9} fill="#B45309" rx={2} />
        <Body tc="#D97706" bc="#78350F" s={SM} />
        <rect x={41} y={89} width={38} height={28} fill="#92400E" rx={5} />
        <rect x={44} y={93} width={32} height={4} fill="#D97706" rx={1} />
        <rect x={44} y={102} width={32} height={4} fill="#D97706" rx={1} />
        <rect x={44} y={111} width={32} height={4} fill="#D97706" rx={1} />
        <circle cx={60} cy={98} r={6} fill="#FCD34D" />
        <circle cx={60} cy={98} r={3.5} fill="#D97706" />
        <line x1={60} y1={89} x2={60} y2={97} stroke="#FCD34D" strokeWidth="1.5" />
        <line x1={60} y1={98} x2={67} y2={98} stroke="#FCD34D" strokeWidth="1.5" />
        <rect x={27} y={97} width={5} height={16} fill="#D97706" rx={2} />
        <path d="M27 95 Q25 88 30 87 Q35 86 34 93" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      </>;

      default: return <circle cx={60} cy={75} r={50} fill="#e5e7eb" />;
    }
  }

  return (
    <svg
      width={size}
      height={Math.round(size * 155 / 120)}
      viewBox="0 0 120 155"
      style={{ filter: selected ? "drop-shadow(0 0 8px #38BDF8)" : "none", display: "block" }}
    >
      {render()}
      <text x={60} y={150} textAnchor="middle" fontSize="9" fill="#6B7280" fontWeight="500">
        {LABELS[id] ?? ""}
      </text>
    </svg>
  );
}
