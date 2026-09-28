export const CHILD_SPEECH_PRESETS = Object.freeze({
  englishInstruction: Object.freeze({
    lang: "en-US",
    rate: 0.82,
    pitch: 1,
    gapAfter: 260,
  }),
  thaiInstruction: Object.freeze({
    lang: "th-TH",
    rate: 0.76,
    pitch: 1,
    gapAfter: 160,
  }),
  englishWord: Object.freeze({
    lang: "en-US",
    rate: 0.76,
    pitch: 1,
    gapAfter: 240,
  }),
  thaiPhonics: Object.freeze({
    lang: "th-TH",
    rate: 0.72,
    pitch: 1,
    gapAfter: 140,
  }),
});

export function cleanSpeechText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\b(?:undefined|null|nan)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildBilingualNarration(englishMessage, thaiMessage) {
  const english = cleanSpeechText(englishMessage);
  const thai = cleanSpeechText(thaiMessage);
  const segments = [];

  if (english) {
    segments.push({
      message: english,
      ...CHILD_SPEECH_PRESETS.englishInstruction,
    });
  }

  if (thai) {
    segments.push({
      message: thai,
      ...CHILD_SPEECH_PRESETS.thaiInstruction,
    });
  }

  return segments;
}

export function buildEnglishInstructionSequence(messages) {
  return messages
    .map(cleanSpeechText)
    .filter(Boolean)
    .map((message) => ({
      message,
      ...CHILD_SPEECH_PRESETS.englishInstruction,
    }));
}
