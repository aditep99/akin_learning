function svgToDataUrl(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createCard({ accent, label, content, glow = accent }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${label}">
      <defs>
        <radialGradient id="halo" cx="50%" cy="44%" r="42%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
          <stop offset="70%" stop-color="${glow}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#24404f" flood-opacity="0.18" />
        </filter>
      </defs>
      <rect width="240" height="240" fill="transparent" />
      <ellipse cx="120" cy="126" rx="84" ry="88" fill="url(#halo)" />
      <g filter="url(#shadow)" transform="translate(0 -6) scale(1.06)">
        ${content}
      </g>
    </svg>
  `;

  return svgToDataUrl(svg);
}

function faceCard(label, accent, highlights, extras = "") {
  return createCard({
    accent,
    label,
    content: `
      <ellipse cx="120" cy="88" rx="54" ry="58" fill="#f3c8a3" />
      <path d="M76 78 C80 42, 162 40, 168 82 C156 62, 138 54, 116 55 C96 56, 84 64, 76 78 Z" fill="#6b4327" />
      <ellipse cx="99" cy="92" rx="12" ry="16" fill="#ffffff" />
      <ellipse cx="141" cy="92" rx="12" ry="16" fill="#ffffff" />
      <circle cx="99" cy="95" r="6" fill="#47352b" />
      <circle cx="141" cy="95" r="6" fill="#47352b" />
      <path d="M110 118 C116 112, 124 112, 130 118" fill="none" stroke="#9b6f56" stroke-width="4" stroke-linecap="round" />
      <path d="M92 74 C98 68, 106 68, 112 73" fill="none" stroke="#6b4327" stroke-width="6" stroke-linecap="round" />
      <path d="M128 73 C134 68, 142 68, 148 74" fill="none" stroke="#6b4327" stroke-width="6" stroke-linecap="round" />
      <circle cx="82" cy="98" r="10" fill="#efbe9c" />
      <circle cx="158" cy="98" r="10" fill="#efbe9c" />
      <path d="M96 132 C108 144, 132 144, 144 132" fill="#ff9d83" />
      ${highlights}
      ${extras}
    `,
  });
}

function torsoCard(label, accent, highlights, extras = "") {
  return createCard({
    accent,
    label,
    content: `
      <circle cx="120" cy="54" r="22" fill="#f3c8a3" />
      <rect x="108" y="72" width="24" height="18" rx="10" fill="#efc29d" />
      <rect x="72" y="88" width="96" height="84" rx="28" fill="#66a8ff" />
      <rect x="60" y="96" width="22" height="82" rx="12" transform="rotate(22 60 96)" fill="#f1c39d" />
      <rect x="158" y="96" width="22" height="82" rx="12" transform="rotate(-22 158 96)" fill="#f1c39d" />
      <rect x="88" y="168" width="64" height="34" rx="12" fill="#f0c24d" />
      <rect x="98" y="194" width="18" height="26" rx="9" fill="#f1c39d" />
      <rect x="124" y="194" width="18" height="26" rx="9" fill="#f1c39d" />
      ${highlights}
      ${extras}
    `,
  });
}

function handCard(label, accent, highlights, extras = "") {
  return createCard({
    accent,
    label,
    content: `
      <path d="M84 150 C78 126, 84 92, 94 82 C100 76, 108 78, 110 86 L112 108 L118 72 C120 62, 132 61, 134 72 L136 108 L142 64 C144 54, 156 54, 158 64 L158 108 L164 74 C166 66, 176 66, 178 76 C182 98, 180 128, 170 152 C160 176, 142 190, 122 192 C102 194, 90 178, 84 150 Z" fill="#f2c7a3" />
      <rect x="96" y="156" width="22" height="26" rx="11" fill="#edb992" />
      ${highlights}
      ${extras}
    `,
  });
}

function legCard(label, accent, highlights, extras = "") {
  return createCard({
    accent,
    label,
    content: `
      <rect x="98" y="40" width="44" height="30" rx="12" fill="#f0c24d" />
      <rect x="98" y="68" width="18" height="90" rx="9" fill="#f1c39d" />
      <rect x="124" y="68" width="18" height="90" rx="9" fill="#f1c39d" />
      <path d="M90 162 C106 154, 120 156, 124 170 C128 182, 116 190, 98 188 C84 186, 80 172, 90 162 Z" fill="#f1c39d" />
      <path d="M118 170 C122 156, 138 154, 152 162 C162 170, 158 186, 144 188 C126 190, 114 182, 118 170 Z" fill="#f1c39d" />
      ${highlights}
      ${extras}
    `,
  });
}

function organCard(label, accent, content) {
  return createCard({
    accent,
    label,
    content,
  });
}

export const bodyWordIllustrations = {
  head: faceCard("head", "#f2a93b", '<ellipse cx="120" cy="88" rx="62" ry="66" fill="none" stroke="#f2a93b" stroke-width="8" />'),
  eye: faceCard("eye", "#4d96ff", '<ellipse cx="99" cy="92" rx="18" ry="12" fill="none" stroke="#4d96ff" stroke-width="6" />'),
  ear: faceCard("ear", "#ff8d6b", '<ellipse cx="160" cy="98" rx="16" ry="20" fill="none" stroke="#ff8d6b" stroke-width="6" />'),
  mouth: faceCard("mouth", "#ff6b6b", '<path d="M94 130 C108 146, 132 146, 146 130" fill="none" stroke="#ff6b6b" stroke-width="7" stroke-linecap="round" />'),
  nose: faceCard("nose", "#6bc357", '<path d="M116 104 C114 118, 114 122, 120 126 C126 122, 126 118, 124 104" fill="none" stroke="#6bc357" stroke-width="6" stroke-linecap="round" />'),
  hand: handCard("hand", "#ff9f4a", '<path d="M94 86 L172 86" stroke="#ff9f4a" stroke-width="6" stroke-linecap="round" opacity="0.0" /><rect x="80" y="70" width="104" height="126" rx="28" fill="none" stroke="#ff9f4a" stroke-width="7" />'),
  arm: torsoCard("arm", "#ff9f4a", '<rect x="48" y="102" width="34" height="80" rx="17" transform="rotate(22 48 102)" fill="none" stroke="#ff9f4a" stroke-width="7" />'),
  leg: legCard("leg", "#4d96ff", '<rect x="96" y="66" width="22" height="96" rx="11" fill="none" stroke="#4d96ff" stroke-width="7" />'),
  foot: legCard("foot", "#6bc357", '<path d="M84 160 C100 150, 122 154, 126 170 C128 184, 116 192, 96 190 C82 188, 76 172, 84 160 Z" fill="none" stroke="#6bc357" stroke-width="7" />'),
  tooth: organCard("tooth", "#4d96ff", `
    <path d="M84 66 C84 46, 100 34, 120 34 C140 34, 156 46, 156 66 C156 88, 148 108, 138 130 C132 144, 126 158, 120 158 C114 158, 108 144, 102 130 C92 108, 84 88, 84 66 Z" fill="#ffffff" stroke="#4d96ff" stroke-width="8" />
    <path d="M98 76 C106 82, 114 84, 120 84 C126 84, 134 82, 142 76" fill="none" stroke="#b7d8ff" stroke-width="6" stroke-linecap="round" />
  `),
  hair: faceCard("hair", "#f29f3d", '<path d="M72 74 C88 42, 154 38, 170 76" fill="none" stroke="#f29f3d" stroke-width="8" stroke-linecap="round" />'),
  face: faceCard("face", "#8f6bff", '<ellipse cx="120" cy="94" rx="58" ry="62" fill="none" stroke="#8f6bff" stroke-width="7" />'),
  neck: torsoCard("neck", "#7fcf59", '<rect x="104" y="68" width="32" height="28" rx="12" fill="none" stroke="#7fcf59" stroke-width="7" />'),
  shoulder: torsoCard("shoulder", "#8f6bff", '<path d="M74 96 C88 84, 102 80, 120 80 C138 80, 152 84, 166 96" fill="none" stroke="#8f6bff" stroke-width="8" stroke-linecap="round" />'),
  finger: handCard("finger", "#6bc357", '<rect x="142" y="54" width="16" height="88" rx="8" fill="none" stroke="#6bc357" stroke-width="6" />'),
  thumb: handCard("thumb", "#ff7f50", '<rect x="78" y="118" width="34" height="20" rx="10" transform="rotate(-28 78 118)" fill="none" stroke="#ff7f50" stroke-width="6" />'),
  knee: legCard("knee", "#ff85b5", '<circle cx="108" cy="128" r="14" fill="none" stroke="#ff85b5" stroke-width="7" />'),
  toe: legCard("toe", "#4d96ff", '<circle cx="90" cy="180" r="6" fill="#4d96ff" /><circle cx="102" cy="182" r="6" fill="#4d96ff" /><circle cx="114" cy="182" r="5" fill="#4d96ff" />'),
  back: torsoCard("back", "#5ba6ff", '<rect x="84" y="94" width="72" height="94" rx="28" fill="none" stroke="#5ba6ff" stroke-width="7" />'),
  stomach: torsoCard("stomach", "#ff9f4a", '<ellipse cx="120" cy="132" rx="24" ry="18" fill="none" stroke="#ff9f4a" stroke-width="7" />'),
  heart: organCard("heart", "#ff6b6b", `
    <path d="M120 166 C88 142, 62 116, 62 88 C62 68, 78 54, 96 54 C108 54, 118 60, 120 70 C122 60, 132 54, 144 54 C162 54, 178 68, 178 88 C178 116, 152 142, 120 166 Z" fill="#ff6b6b" />
    <path d="M84 98 L102 98 L112 82 L124 114 L134 98 L156 98" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  `),
  brain: organCard("brain", "#8f6bff", `
    <path d="M82 118 C66 108, 64 84, 80 72 C84 54, 104 48, 118 56 C132 46, 154 50, 160 68 C178 74, 182 100, 168 114 C170 136, 152 150, 134 146 C122 156, 100 154, 90 142 C74 142, 64 128, 82 118 Z" fill="#d7c4ff" stroke="#8f6bff" stroke-width="7" />
    <path d="M100 76 C96 88, 98 98, 108 106 M124 70 C122 84, 124 96, 136 108 M92 118 C102 122, 114 124, 122 132 M140 114 C136 126, 134 134, 126 142" fill="none" stroke="#8f6bff" stroke-width="5" stroke-linecap="round" />
  `),
  lip: faceCard("lip", "#ff7fb0", '<path d="M96 130 C106 124, 114 122, 120 122 C126 122, 134 124, 144 130 C134 138, 126 140, 120 140 C114 140, 106 138, 96 130 Z" fill="none" stroke="#ff7fb0" stroke-width="7" stroke-linejoin="round" />'),
  tongue: faceCard("tongue", "#ff6ba8", '<path d="M106 132 C110 146, 130 146, 134 132" fill="none" stroke="#ff6ba8" stroke-width="7" stroke-linecap="round" />'),
  chin: faceCard("chin", "#ff9f4a", '<path d="M104 144 C112 150, 128 150, 136 144" fill="none" stroke="#ff9f4a" stroke-width="7" stroke-linecap="round" />'),
  cheek: faceCard("cheek", "#ff8db3", '<circle cx="88" cy="116" r="13" fill="none" stroke="#ff8db3" stroke-width="7" />'),
  eyebrow: faceCard("eyebrow", "#6b55d8", '<path d="M88 72 C96 66, 106 66, 114 72" fill="none" stroke="#6b55d8" stroke-width="7" stroke-linecap="round" />'),
  forehead: faceCard("forehead", "#f3b64f", '<rect x="84" y="48" width="72" height="28" rx="14" fill="none" stroke="#f3b64f" stroke-width="7" />'),
  elbow: torsoCard("elbow", "#ff8d6b", '<circle cx="72" cy="138" r="12" fill="none" stroke="#ff8d6b" stroke-width="7" />'),
  wrist: handCard("wrist", "#4d96ff", '<rect x="90" y="160" width="26" height="16" rx="8" fill="none" stroke="#4d96ff" stroke-width="6" />'),
  waist: torsoCard("waist", "#ff85b5", '<rect x="92" y="148" width="56" height="18" rx="9" fill="none" stroke="#ff85b5" stroke-width="7" />'),
  hip: legCard("hip", "#8f6bff", '<rect x="88" y="44" width="64" height="34" rx="16" fill="none" stroke="#8f6bff" stroke-width="7" />'),
  heel: legCard("heel", "#ff9f4a", '<circle cx="88" cy="174" r="10" fill="none" stroke="#ff9f4a" stroke-width="7" />'),
  ankle: legCard("ankle", "#6bc357", '<circle cx="108" cy="156" r="11" fill="none" stroke="#6bc357" stroke-width="7" />'),
  skin: organCard("skin", "#f2a176", `
    <rect x="72" y="56" width="96" height="124" rx="26" fill="#f4cfaf" stroke="#f2a176" stroke-width="7" />
    <path d="M90 90 C110 82, 132 82, 150 92 M90 120 C110 112, 132 112, 150 122 M90 150 C110 142, 132 142, 150 152" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
  `),
  bone: organCard("bone", "#4d96ff", `
    <path d="M88 86 C78 70, 94 54, 110 64 L130 64 C146 54, 162 70, 152 86 C162 102, 146 118, 130 108 L110 108 C94 118, 78 102, 88 86 Z M88 146 C78 130, 94 114, 110 124 L130 124 C146 114, 162 130, 152 146 C162 162, 146 178, 130 168 L110 168 C94 178, 78 162, 88 146 Z" fill="#ffffff" stroke="#4d96ff" stroke-width="7" />
  `),
  muscle: organCard("muscle", "#ff7f50", `
    <path d="M74 148 C74 122, 90 104, 106 98 C106 82, 116 72, 128 72 C142 72, 150 82, 150 98 C164 104, 176 120, 176 142 C176 162, 160 176, 138 176 L108 176 C88 176, 74 164, 74 148 Z" fill="#ffb08d" stroke="#ff7f50" stroke-width="7" />
    <path d="M100 110 C110 122, 130 124, 144 110" fill="none" stroke="#ff7f50" stroke-width="6" stroke-linecap="round" />
  `),
  chest: torsoCard("chest", "#6bc357", '<rect x="90" y="98" width="60" height="36" rx="18" fill="none" stroke="#6bc357" stroke-width="7" />'),
  throat: torsoCard("throat", "#4d96ff", '<rect x="108" y="76" width="24" height="22" rx="10" fill="none" stroke="#4d96ff" stroke-width="7" />'),
  lung: organCard("lung", "#ff8db3", `
    <path d="M110 72 C100 82, 94 98, 92 128 C92 154, 102 170, 118 170 C130 170, 136 160, 136 146 L136 108 C136 92, 128 78, 120 70 Z" fill="#ffc0cf" stroke="#ff8db3" stroke-width="7" />
    <path d="M130 72 C140 82, 146 98, 148 128 C148 154, 138 170, 122 170 C110 170, 104 160, 104 146 L104 108 C104 92, 112 78, 120 70 Z" fill="#ffc0cf" stroke="#ff8db3" stroke-width="7" />
  `),
  beard: faceCard("beard", "#8f6bff", '<path d="M92 130 C96 156, 110 170, 120 170 C130 170, 144 156, 148 130" fill="none" stroke="#8f6bff" stroke-width="7" stroke-linecap="round" />'),
  moustache: faceCard("moustache", "#ff9f4a", '<path d="M102 120 C110 112, 116 112, 120 120 C124 112, 130 112, 138 120" fill="none" stroke="#ff9f4a" stroke-width="7" stroke-linecap="round" />'),
  body: torsoCard("body", "#5ba6ff", '<rect x="70" y="32" width="100" height="174" rx="42" fill="none" stroke="#5ba6ff" stroke-width="7" />'),
  teeth: organCard("teeth", "#6bc357", `
    <rect x="74" y="82" width="92" height="56" rx="18" fill="#ffffff" stroke="#6bc357" stroke-width="7" />
    <path d="M92 82 L92 138 M110 82 L110 138 M128 82 L128 138 M146 82 L146 138" stroke="#cfe9c9" stroke-width="5" />
  `),
  palm: handCard("palm", "#f2a93b", '<ellipse cx="122" cy="136" rx="34" ry="42" fill="none" stroke="#f2a93b" stroke-width="7" />'),
  nail: handCard("nail", "#ff7fb0", '<rect x="144" y="50" width="14" height="18" rx="6" fill="none" stroke="#ff7fb0" stroke-width="5" />'),
  fist: handCard("fist", "#ff6b6b", '<rect x="92" y="96" width="64" height="58" rx="20" fill="none" stroke="#ff6b6b" stroke-width="7" />'),
  jaw: faceCard("jaw", "#4d96ff", '<path d="M92 132 C96 154, 108 164, 120 164 C132 164, 144 154, 148 132" fill="none" stroke="#4d96ff" stroke-width="7" />'),
  eyelash: faceCard("eyelash", "#6bc357", '<path d="M88 80 L92 68 M98 76 L102 64 M108 76 L112 64" fill="none" stroke="#6bc357" stroke-width="5" stroke-linecap="round" />'),
  belly: torsoCard("belly", "#ff9f4a", '<ellipse cx="120" cy="136" rx="30" ry="24" fill="none" stroke="#ff9f4a" stroke-width="7" />'),
  thigh: legCard("thigh", "#8f6bff", '<rect x="96" y="68" width="22" height="58" rx="11" fill="none" stroke="#8f6bff" stroke-width="7" />'),
  navel: torsoCard("navel", "#ff6b6b", '<circle cx="120" cy="148" r="8" fill="none" stroke="#ff6b6b" stroke-width="6" />'),
  nipple: torsoCard("nipple", "#ff7fb0", '<circle cx="104" cy="112" r="5" fill="#ff7fb0" /><circle cx="136" cy="112" r="5" fill="#ff7fb0" />'),
};
