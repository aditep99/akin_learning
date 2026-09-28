function emojiToCodePoints(emoji) {
  return Array.from(emoji.replace(/\uFE0F/g, ""))
    .map((symbol) => symbol.codePointAt(0).toString(16))
    .join("-");
}

export function hasRealImage(word) {
  return Boolean(word?.image);
}

export function getWordImage(word) {
  if (hasRealImage(word)) {
    return word.image;
  }

  if (!word.emoji) {
    return null;
  }

  const codePoints = emojiToCodePoints(word.emoji);

  return `/images/twemoji/${codePoints}.svg`;
}

export function isAnimalPhotoWord(word) {
  return hasRealImage(word);
}
