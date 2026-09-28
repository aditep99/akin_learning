import { useEffect, useState } from "react";

function supportsSpeech() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function AudioReplayButton({
  available = true,
  className = "",
  isSpeaking: controlledIsSpeaking,
  label = "ฟังอีกครั้ง",
  onReplay,
}) {
  const [localIsSpeaking, setLocalIsSpeaking] = useState(false);
  const isSpeaking = controlledIsSpeaking ?? localIsSpeaking;
  const isAvailable = available && supportsSpeech() && typeof onReplay === "function";

  useEffect(() => {
    if (!localIsSpeaking || controlledIsSpeaking !== undefined) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLocalIsSpeaking(false);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [controlledIsSpeaking, localIsSpeaking]);

  if (!isAvailable) {
    return null;
  }

  return (
    <button
      type="button"
      className={`audio-replay-button ${
        isSpeaking ? "audio-replay-button--speaking" : ""
      } ${className}`.trim()}
      aria-label={label}
      title={label}
      onClick={() => {
        if (controlledIsSpeaking === undefined) {
          setLocalIsSpeaking(true);
        }
        onReplay();
      }}
    >
      <span className="audio-replay-button__waves" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9v6h4l5 4V5L9 9H5Zm11.5 3a4.5 4.5 0 0 0-1.7-3.5v7A4.5 4.5 0 0 0 16.5 12Zm-1.7-7.2v2.1a6.5 6.5 0 0 1 0 10.2v2.1a8.5 8.5 0 0 0 0-13.4Z" />
      </svg>
      <span className="sr-only">{label}</span>
    </button>
  );
}
