function svgDataUri(markup) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
}

function wrapSvg(content, background = "#f4fbff") {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
      <rect width="240" height="180" rx="28" fill="${background}"/>
      ${content}
    </svg>
  `);
}

export function createVisualWord({
  id,
  word,
  translation,
  phonics,
  image,
  sciencePhotoAssetId,
  emoji = "⭐",
}) {
  return {
    id,
    word,
    translation,
    phonics: phonics || word.toLowerCase(),
    emoji,
    image,
    ...(sciencePhotoAssetId ? { sciencePhotoAssetId } : {}),
    pronunciation: {
      guide: word.toLowerCase(),
      ipa: "",
    },
  };
}

const plantHighlights = {
  root: '<path d="M111 124 92 158M119 124l4 38m6-38 24 32" stroke="#ff7f50" stroke-width="11" stroke-linecap="round"/>',
  stem: '<path d="M120 126V72" stroke="#ff7f50" stroke-width="13" stroke-linecap="round"/>',
  leaf: '<path d="M116 94C83 69 67 91 76 109c16 8 31 0 40-15ZM125 86c29-28 51-6 42 14-16 10-31 3-42-14Z" fill="#ff7f50"/>',
  flower: '<circle cx="120" cy="48" r="15" fill="#ffd54f"/><g fill="#ff7f50"><circle cx="120" cy="26" r="15"/><circle cx="142" cy="43" r="15"/><circle cx="134" cy="67" r="15"/><circle cx="106" cy="67" r="15"/><circle cx="98" cy="43" r="15"/></g>',
  fruit: '<circle cx="151" cy="93" r="21" fill="#ff7f50"/><path d="M151 73c4-11 12-15 22-16" stroke="#4caf50" stroke-width="7" stroke-linecap="round"/>',
};

export function makePlantPartImage(part) {
  return wrapSvg(`
    <path d="M120 128V70" stroke="#55a96b" stroke-width="10" stroke-linecap="round"/>
    <path d="M115 96C85 73 69 93 78 111c17 7 29-1 37-15ZM126 87c27-25 48-6 40 13-15 9-29 2-40-13Z" fill="#78c986"/>
    <g fill="#ff9eb5"><circle cx="120" cy="27" r="14"/><circle cx="141" cy="43" r="14"/><circle cx="133" cy="65" r="14"/><circle cx="107" cy="65" r="14"/><circle cx="99" cy="43" r="14"/></g>
    <circle cx="120" cy="47" r="13" fill="#ffd85d"/>
    <circle cx="151" cy="93" r="18" fill="#f7b14b"/>
    <path d="M111 127 94 158M120 127l3 35m8-35 22 30" stroke="#a8734d" stroke-width="8" stroke-linecap="round"/>
    <rect x="64" y="160" width="112" height="8" rx="4" fill="#c69166"/>
    ${plantHighlights[part] || ""}
  `, "#f5fff2");
}

export function makePronounImage(kind) {
  const people = {
    he: '<circle cx="120" cy="54" r="25" fill="#7ab8ff"/><path d="M78 145c4-43 19-66 42-66s38 23 42 66" fill="#4f88e8"/>',
    she: '<circle cx="120" cy="54" r="25" fill="#ff9fbd"/><path d="m120 79-48 70h96Z" fill="#e9689b"/>',
    it: '<circle cx="120" cy="83" r="48" fill="#ffd35f"/><path d="M82 67 69 41l30 14m59 12 13-26-30 14" fill="#ffd35f"/><circle cx="104" cy="82" r="6" fill="#29485a"/><circle cx="136" cy="82" r="6" fill="#29485a"/>',
    they: '<g><circle cx="88" cy="57" r="22" fill="#7ab8ff"/><circle cx="150" cy="57" r="22" fill="#ff9fbd"/><path d="M52 145c4-40 17-63 36-63s32 23 36 63" fill="#4f88e8"/><path d="M113 145c4-40 17-63 37-63s33 23 37 63" fill="#e9689b"/></g>',
  };
  return wrapSvg(people[kind] || people.it, "#fff9ef");
}

export function makePluralImage(symbol, count) {
  const positions =
    count === 1
      ? [{ x: 120, y: 94, size: 72 }]
      : [
          { x: 78, y: 73, size: 54 },
          { x: 155, y: 73, size: 54 },
          { x: 116, y: 132, size: 54 },
        ];

  return wrapSvg(
    positions
      .map(
        ({ x, y, size }) =>
          `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" font-family="Segoe UI Emoji">${symbol}</text>`,
      )
      .join(""),
    count === 1 ? "#fff8e8" : "#effff4",
  );
}

export function makePositionImage(position) {
  const ballPositions = {
    in: { cx: 120, cy: 111 },
    on: { cx: 120, cy: 48 },
    under: { cx: 120, cy: 151 },
    "next-to": { cx: 190, cy: 112 },
  };
  const { cx, cy } = ballPositions[position] || ballPositions.in;

  return wrapSvg(`
    <rect x="74" y="72" width="92" height="68" rx="10" fill="#9fd7ff" stroke="#4e89c7" stroke-width="7"/>
    <path d="M74 82 120 54l46 28" fill="#dff2ff" stroke="#4e89c7" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="19" fill="#ff6b6b" stroke="#b43f4b" stroke-width="5"/>
    <circle cx="${cx - 6}" cy="${cy - 6}" r="5" fill="#fff" opacity=".72"/>
  `);
}
