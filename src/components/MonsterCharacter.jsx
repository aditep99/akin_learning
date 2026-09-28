import { useId } from "react";
import { getMonsterBuddy } from "../data/characterRoster";

function Eye({ x, y, size = 11 }) {
  return (
    <>
      <circle cx={x} cy={y} r={size} fill="#243F50" />
      <circle cx={x + size * 0.28} cy={y - size * 0.28} r={size * 0.28} fill="#fff" />
    </>
  );
}

function Face({ buddy, y = 104 }) {
  const eyePositions =
    buddy.eyes === 1
      ? [110]
      : buddy.eyes === 3
        ? [78, 110, 142]
        : [88, 132];

  return (
    <>
      {eyePositions.map((x) => (
        <Eye key={x} x={x} y={y} size={buddy.eyes === 3 ? 8 : 10} />
      ))}
      <path
        d={`M88 ${y + 34} Q110 ${y + 50} 132 ${y + 34}`}
        fill="none"
        stroke="#243F50"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="72" cy={y + 24} r="8" fill="#FF9A9A" opacity="0.7" />
      <circle cx="148" cy={y + 24} r="8" fill="#FF9A9A" opacity="0.7" />
    </>
  );
}

function BoatMonster({ buddy }) {
  return (
    <>
      <path d="M48 122H177L158 176H70L48 122Z" fill={buddy.primary} />
      <path d="M60 137H166L156 164H72L60 137Z" fill={buddy.secondary} />
      <path d="M106 42V122" stroke="#4A6477" strokeWidth="9" strokeLinecap="round" />
      <path d="M112 48L160 84L112 98V48Z" fill={buddy.accent} />
      <rect x="76" y="88" width="60" height="45" rx="22" fill={buddy.primary} />
      <Face buddy={buddy} y={104} />
      <path d="M58 187Q84 176 110 187T162 187" fill="none" stroke="#78D7EF" strokeWidth="10" strokeLinecap="round" />
    </>
  );
}

function SoldierMonster({ buddy }) {
  return (
    <>
      <ellipse cx="110" cy="124" rx="66" ry="70" fill={buddy.primary} />
      <ellipse cx="110" cy="126" rx="51" ry="55" fill={buddy.secondary} />
      <path d="M58 88Q62 40 110 38Q158 40 162 88Z" fill="#597B4F" />
      <rect x="56" y="82" width="108" height="18" rx="9" fill="#486943" />
      <circle cx="110" cy="62" r="14" fill={buddy.accent} />
      <path d="M110 52V72M100 62H120" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <Face buddy={buddy} y={114} />
      <path d="M79 170H141L134 201H86L79 170Z" fill="#56784E" />
      <path d="M110 172V200" stroke="#D8E6C4" strokeWidth="5" />
    </>
  );
}

function VehicleMonster({ buddy }) {
  const isPlane = buddy.kind === "plane";
  const isTrain = buddy.kind === "train";
  const isRacer = buddy.kind === "racer";
  const isSubmarine = buddy.kind === "submarine";
  const isRocket = buddy.kind === "rocket";

  if (isRocket) {
    return (
      <>
        <path d="M110 28Q158 65 150 143L110 176L70 143Q62 65 110 28Z" fill={buddy.primary} />
        <ellipse cx="110" cy="102" rx="31" ry="36" fill={buddy.secondary} />
        <Face buddy={buddy} y={95} />
        <path d="M81 148L55 176L84 178Z" fill={buddy.accent} />
        <path d="M139 148L165 176L136 178Z" fill={buddy.accent} />
        <path d="M94 174L110 207L126 174Z" fill="#FF8A58" />
      </>
    );
  }

  if (isPlane) {
    return (
      <>
        <path d="M34 120L91 101L100 48H121L130 101L188 120L184 140L130 132L123 183H98L91 132L36 140Z" fill={buddy.primary} />
        <ellipse cx="110" cy="119" rx="34" ry="43" fill={buddy.secondary} />
        <Face buddy={buddy} y={112} />
      </>
    );
  }

  if (isSubmarine) {
    return (
      <>
        <ellipse cx="105" cy="128" rx="76" ry="51" fill={buddy.primary} />
        <path d="M74 80H127V104H74Z" fill={buddy.primary} />
        <path d="M99 80V54H135" fill="none" stroke="#477A75" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="108" cy="126" rx="47" ry="37" fill={buddy.secondary} />
        <Face buddy={buddy} y={117} />
        <path d="M177 111L205 91V165L177 145Z" fill={buddy.accent} />
        <circle cx="52" cy="67" r="9" fill="#8CDDF2" opacity="0.8" />
        <circle cx="35" cy="47" r="6" fill="#8CDDF2" opacity="0.7" />
      </>
    );
  }

  if (isTrain) {
    return (
      <>
        <rect x="46" y="72" width="128" height="100" rx="28" fill={buddy.primary} />
        <rect x="68" y="91" width="84" height="62" rx="24" fill={buddy.secondary} />
        <rect x="73" y="43" width="74" height="38" rx="13" fill={buddy.accent} />
        <Face buddy={buddy} y={112} />
        <circle cx="76" cy="181" r="18" fill="#3B5264" />
        <circle cx="146" cy="181" r="18" fill="#3B5264" />
        <rect x="164" y="113" width="30" height="30" rx="9" fill={buddy.accent} />
      </>
    );
  }

  if (isRacer) {
    return (
      <>
        <path d="M35 121Q44 89 79 85H145Q174 91 188 124V164H35V121Z" fill={buddy.primary} />
        <path d="M79 88L96 58H135L151 88Z" fill={buddy.secondary} />
        <ellipse cx="111" cy="121" rx="45" ry="34" fill={buddy.secondary} />
        <Face buddy={buddy} y={112} />
        <circle cx="72" cy="169" r="20" fill="#344A5B" />
        <circle cx="155" cy="169" r="20" fill="#344A5B" />
        <path d="M39 143H185" stroke={buddy.accent} strokeWidth="8" />
      </>
    );
  }

  return null;
}

function BaseMonster({ buddy }) {
  const isSquare = buddy.kind === "square";
  const isTall = buddy.kind === "tall";
  const isCloud = buddy.kind === "cloud";
  const body = isSquare ? (
    <rect x="48" y="52" width="124" height="136" rx="40" fill={buddy.primary} />
  ) : isTall ? (
    <ellipse cx="110" cy="120" rx="55" ry="81" fill={buddy.primary} />
  ) : isCloud ? (
    <path d="M48 155Q24 137 42 111Q35 76 72 72Q91 37 122 62Q155 43 171 77Q199 83 190 116Q204 143 175 157Q142 189 110 172Q72 191 48 155Z" fill={buddy.primary} />
  ) : (
    <ellipse cx="110" cy="122" rx="70" ry="69" fill={buddy.primary} />
  );

  return (
    <>
      {body}
      <ellipse cx="110" cy="124" rx={isTall ? 42 : 53} ry={isTall ? 60 : 53} fill={buddy.secondary} />
      <path d="M70 61L55 38" stroke={buddy.primary} strokeWidth="12" strokeLinecap="round" />
      <path d="M150 61L165 38" stroke={buddy.primary} strokeWidth="12" strokeLinecap="round" />
      <circle cx="52" cy="34" r="9" fill={buddy.accent} />
      <circle cx="168" cy="34" r="9" fill={buddy.accent} />
      <Face buddy={buddy} y={109} />
      <circle cx="110" cy="167" r="23" fill="#fff" opacity="0.82" />
      <text x="110" y="177" textAnchor="middle" fontSize="25" aria-hidden="true">
        {buddy.badge}
      </text>
      <path d="M78 181L70 205" stroke={buddy.primary} strokeWidth="14" strokeLinecap="round" />
      <path d="M142 181L150 205" stroke={buddy.primary} strokeWidth="14" strokeLinecap="round" />
    </>
  );
}

export function MonsterCharacter({
  buddyId,
  className = "",
  decorative = false,
  title,
}) {
  const buddy = getMonsterBuddy(buddyId);
  const uniqueId = useId().replace(/:/g, "");
  const isVehicle = ["rocket", "submarine", "train", "plane", "racer"].includes(
    buddy.kind,
  );

  return (
    <svg
      viewBox="0 0 220 220"
      className={`monster-character ${className}`.trim()}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : title || `${buddy.name}, ${buddy.role}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`buddy-shadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#274255" floodOpacity="0.18" />
        </filter>
      </defs>
      <ellipse cx="110" cy="205" rx="66" ry="10" fill="#385165" opacity="0.12" />
      <g filter={`url(#buddy-shadow-${uniqueId})`}>
        {buddy.kind === "boat" ? <BoatMonster buddy={buddy} /> : null}
        {buddy.kind === "soldier" ? <SoldierMonster buddy={buddy} /> : null}
        {isVehicle ? <VehicleMonster buddy={buddy} /> : null}
        {!isVehicle && !["boat", "soldier"].includes(buddy.kind) ? (
          <BaseMonster buddy={buddy} />
        ) : null}
      </g>
    </svg>
  );
}
