export function getPronunciationData(word) {
  return {
    guide: word.pronunciation?.guide || "",
    ipa: word.pronunciation?.ipa || "",
    phonics: word.phonics || "",
  };
}
