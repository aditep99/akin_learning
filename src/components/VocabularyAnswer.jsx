import { useEffect, useState } from "react";
import { getWordImage } from "../utils/wordImage";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getWordText(word, fallback = "Answer") {
  return word?.word || fallback;
}

/**
 * Shared visual owner for vocabulary answers across child mission surfaces.
 * Image URLs can be generated from emoji, so an image error must never leave
 * an answer card visually empty.
 */
export function VocabularyVisual({
  alt,
  className = "",
  decorative = false,
  imageClassName = "",
  word,
}) {
  const image = getWordImage(word);
  const [imageFailed, setImageFailed] = useState(false);
  const accessibleName = alt || getWordText(word);
  const visualAriaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": accessibleName };

  useEffect(() => {
    setImageFailed(false);
  }, [image, word?.id]);

  if (word?.answerVisual?.kind === "color") {
    return (
      <span
        {...visualAriaProps}
        className={joinClasses(
          "vocabulary-visual",
          "vocabulary-visual--color",
          className,
        )}
        data-color-token={word.answerVisual.token}
      />
    );
  }

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt={decorative ? "" : accessibleName}
        className={joinClasses("vocabulary-visual", imageClassName, className)}
        draggable="false"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      {...visualAriaProps}
      className={joinClasses(
        "vocabulary-visual",
        "vocabulary-visual--fallback",
        className,
      )}
    >
      {word?.emoji || getWordText(word)}
    </span>
  );
}

export function VocabularyLabel({
  className = "",
  placeholder = "Hidden word",
  reveal = false,
  showValue = false,
  value,
}) {
  const isVisible = reveal || showValue;

  return isVisible ? (
    <strong className={joinClasses("learning-vocabulary-label", className)}>
      {value}
    </strong>
  ) : (
    <span className={joinClasses("learning-vocabulary-placeholder", className)}>
      {placeholder}
    </span>
  );
}

/**
 * Canonical learner-facing word metadata. Phonics stays available to the
 * narration layer, but the visible learning surface uses meaning and IPA.
 */
export function VocabularyMeta({
  className = "",
  showIpa = true,
  showMeaning = true,
  word,
}) {
  const meaning = showMeaning ? word?.translation || "" : "";
  const ipa = showIpa ? word?.pronunciation?.ipa || "" : "";

  if (!meaning && !ipa) {
    return null;
  }

  const accessibleLabel = [
    meaning,
    ipa ? `IPA ${ipa}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <span
      className={joinClasses("vocabulary-meta", className)}
      aria-label={accessibleLabel}
    >
      {meaning ? (
        <span className="vocabulary-meta__meaning">{meaning}</span>
      ) : null}
      {ipa ? <span className="vocabulary-meta__ipa">{ipa}</span> : null}
    </span>
  );
}
