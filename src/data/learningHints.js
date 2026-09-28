export function getLearningHint(challenge = {}, attemptState = {}) {
  const requestedLevel = Number(attemptState.hintLevel) || 0;
  const wrongAttempts = Number(attemptState.wrongAttempts) || 0;
  const level = Math.min(3, Math.max(1, requestedLevel || wrongAttempts + 1));
  const word =
    challenge.targetWord?.word ||
    challenge.reviewWord?.word ||
    challenge.word ||
    challenge.promptWord ||
    "คำนี้";
  const vocabulary = challenge.targetWord || challenge.reviewWord || challenge;
  const meaning = vocabulary.translation || "";
  const ipa = vocabulary.pronunciation?.ipa || "";
  const mode = challenge.mode || "activity";

  if (challenge.type === "math-genius" && mode === "column-equation-input") {
    const isBorrow = challenge.regrouping === "borrow";
    const isCarry = challenge.regrouping === "carry";
    const firstStep = isBorrow
      ? "ลดหลักสิบลงหนึ่ง แล้วเพิ่มหลักหน่วยอีกสิบ"
      : "เริ่มคำนวณจากหลักหน่วยก่อน";
    const secondStep = isBorrow
      ? "กรอกค่าหลังยืมให้ครบ แล้วค่อยใส่คำตอบหลักหน่วย"
      : isCarry
        ? "ถ้าผลหลักหน่วยครบสิบ ให้ใส่ตัวทดเหนือหลักสิบ"
        : "ใส่คำตอบหลักหน่วย แล้วเลื่อนไปหลักสิบ";

    if (level === 1) {
      return {
        level,
        title: "Column Math Hint 1",
        message: `${firstStep} · ${isBorrow ? "Adjust tens and ones first." : "Start with the ones place."}`,
        action: "step",
      };
    }

    if (level === 2) {
      return {
        level,
        title: "Column Math Hint 2",
        message: `${secondStep} · Keep each value in its own slot.`,
        action: "step",
      };
    }

    return {
      level: 3,
      title: "Column Math Hint 3",
      message: "ตรวจทีละช่องจากขวาไปซ้าย แล้วกด Check เมื่อกรอกครบ · Check each slot from right to left.",
      action: "step",
    };
  }

  if (level === 1) {
    return {
      level,
      title: "Monster Hint 1",
      message:
        mode.includes("sound") || challenge.audio
          ? "ลองฟังเสียงต้นคำอีกครั้ง แล้วสังเกตภาพที่เข้าคู่กัน"
          : "ลองมองภาพและฟังคำใบ้อีกครั้ง ค่อย ๆ เลือกได้เลย",
      action: "listen",
    };
  }

  if (level === 2) {
    return {
      level,
      title: "Monster Hint 2",
      message: `มองหาภาพหรือคำที่เกี่ยวข้องกับ “${word}” แล้วตัดตัวเลือกที่ไม่ใช่ออก`,
      action: "narrow",
    };
  }

  return {
    level: 3,
    title: "Monster Hint 3",
    message:
      meaning || ipa
        ? `ความหมาย: ${meaning || "—"}${ipa ? ` · IPA: ${ipa}` : ""}`
        : `ตัวอย่าง: ${word}`,
    action: "example",
  };
}
