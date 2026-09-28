import { useCallback, useEffect, useState } from "react";
import {
  CHILD_SPEECH_PRESETS,
  cleanSpeechText,
} from "../utils/narrationScript";

let cachedEnglishUsVoice = null;
let cachedThaiVoice = null;
let pendingSpeechTimeoutId = null;
let followUpSpeechTimeoutId = null;
let retrySpeechTimeoutId = null;
let voicesPrimed = false;
let activeSpeechRequestId = 0;

function resetVoiceCache() {
  cachedEnglishUsVoice = null;
  cachedThaiVoice = null;
}

function clearPendingSpeechTimeout() {
  if (pendingSpeechTimeoutId) {
    window.clearTimeout(pendingSpeechTimeoutId);
    pendingSpeechTimeoutId = null;
  }
}

function clearFollowUpSpeechTimeout() {
  if (followUpSpeechTimeoutId) {
    window.clearTimeout(followUpSpeechTimeoutId);
    followUpSpeechTimeoutId = null;
  }
}

function clearRetrySpeechTimeout() {
  if (retrySpeechTimeoutId) {
    window.clearTimeout(retrySpeechTimeoutId);
    retrySpeechTimeoutId = null;
  }
}

function clearSpeechTimers() {
  clearPendingSpeechTimeout();
  clearFollowUpSpeechTimeout();
  clearRetrySpeechTimeout();
}

function hasSpeechSupport() {
  return typeof window !== "undefined" && Boolean(window.speechSynthesis);
}

function primeVoices() {
  if (!hasSpeechSupport()) {
    return;
  }

  const speechEngine = window.speechSynthesis;
  speechEngine.getVoices();

  if (voicesPrimed) {
    return;
  }

  const handleVoicesChanged = () => {
    resetVoiceCache();
    speechEngine.getVoices();
  };

  if (typeof speechEngine.addEventListener === "function") {
    speechEngine.addEventListener("voiceschanged", handleVoicesChanged);
  } else {
    speechEngine.onvoiceschanged = handleVoicesChanged;
  }

  voicesPrimed = true;
}

function stopSpeechRequest() {
  if (!hasSpeechSupport()) {
    return;
  }

  activeSpeechRequestId += 1;
  clearSpeechTimers();
  window.speechSynthesis.cancel();
}

function startSpeechRequest() {
  if (!hasSpeechSupport()) {
    return 0;
  }

  stopSpeechRequest();
  return activeSpeechRequestId;
}

function getVoices() {
  if (!hasSpeechSupport()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

function scoreEnglishUsVoice(voice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === "en-us") {
    score += 120;
  } else if (lang.startsWith("en-us")) {
    score += 110;
  } else if (lang.startsWith("en")) {
    score += 40;
  }

  if (name.includes("united states") || name.includes("american")) {
    score += 35;
  }

  if (name.includes("us english") || name.includes("english us")) {
    score += 30;
  }

  if (name.includes("google us english")) {
    score += 45;
  }

  if (
    name.includes("natural") ||
    name.includes("aria") ||
    name.includes("jenny")
  ) {
    score += 55;
  }

  if (name.includes("microsoft") && lang.startsWith("en-us")) {
    score += 25;
  }

  if (voice.localService) {
    score += 5;
  }

  if (voice.default) {
    score += 3;
  }

  return score;
}

function getPreferredEnglishUsVoice() {
  if (cachedEnglishUsVoice) {
    return cachedEnglishUsVoice;
  }

  const voices = getVoices();
  if (voices.length === 0) {
    return null;
  }

  const rankedVoice = [...voices]
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
    .sort(
      (firstVoice, secondVoice) =>
        scoreEnglishUsVoice(secondVoice) - scoreEnglishUsVoice(firstVoice),
    )[0];

  cachedEnglishUsVoice = rankedVoice || null;
  return cachedEnglishUsVoice;
}

function getPreferredThaiVoice() {
  if (cachedThaiVoice) {
    return cachedThaiVoice;
  }

  const thaiVoice =
    [...getVoices()]
      .filter((voice) => voice.lang.toLowerCase().startsWith("th"))
      .sort((firstVoice, secondVoice) => {
        const scoreVoice = (voice) => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase();
          let score = lang === "th-th" ? 100 : 50;

          if (
            name.includes("natural") ||
            name.includes("premwadee") ||
            name.includes("pattara") ||
            name.includes("narisa")
          ) {
            score += 45;
          }

          if (voice.localService) {
            score += 5;
          }

          return score;
        };

        return scoreVoice(secondVoice) - scoreVoice(firstVoice);
      })[0] || null;

  cachedThaiVoice = thaiVoice;
  return cachedThaiVoice;
}

function assignPreferredVoice(utterance) {
  if (!utterance) {
    return;
  }

  const lang = utterance.lang?.toLowerCase() || "";
  const preferredVoice = lang.startsWith("en")
    ? getPreferredEnglishUsVoice()
    : lang.startsWith("th")
      ? getPreferredThaiVoice()
      : null;

  if (preferredVoice) {
    utterance.voice = preferredVoice;
    utterance.lang = preferredVoice.lang;
  }
}

function normalizeSegment(segment) {
  const message = cleanSpeechText(segment?.message);

  if (!message) {
    return null;
  }

  return {
    lang: segment.lang || "en-US",
    message,
    rate: segment.rate ?? CHILD_SPEECH_PRESETS.englishInstruction.rate,
    pitch: segment.pitch ?? CHILD_SPEECH_PRESETS.englishInstruction.pitch,
    delay: segment.delay ?? null,
    gapAfter: segment.gapAfter ?? 180,
  };
}

function createUtterance({ message, lang, rate, pitch }) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;

  return utterance;
}

function scheduleSpeak(utterance, requestId, delayOverride = null, onFailed) {
  if (!hasSpeechSupport()) {
    return;
  }

  const speechEngine = window.speechSynthesis;
  const speakNow = () => {
    pendingSpeechTimeoutId = null;

    if (requestId !== activeSpeechRequestId) {
      return;
    }

    assignPreferredVoice(utterance);

    try {
      if (speechEngine.paused) {
        speechEngine.resume();
      }
    } catch {
      // Ignore resume failures and try to speak anyway.
    }

    try {
      speechEngine.speak(utterance);
    } catch {
      if (typeof onFailed === "function") {
        onFailed();
      }
    }
  };

  clearPendingSpeechTimeout();
  pendingSpeechTimeoutId = window.setTimeout(
    speakNow,
    delayOverride ?? (speechEngine.speaking || speechEngine.pending ? 140 : 48),
  );
}

function playSegments(
  segments,
  requestId,
  segmentIndex = 0,
  didRetry = false,
  callbacks = {},
) {
  const segment = segments[segmentIndex];
  if (!segment || requestId !== activeSpeechRequestId) {
    return;
  }

  const utterance = createUtterance(segment);

  utterance.onstart = () => {
    if (segmentIndex === 0 && requestId === activeSpeechRequestId) {
      callbacks.onStart?.();
    }
  };

  utterance.onend = () => {
    if (requestId !== activeSpeechRequestId) {
      return;
    }

    if (segmentIndex >= segments.length - 1) {
      callbacks.onEnd?.();
      return;
    }

    clearFollowUpSpeechTimeout();
    followUpSpeechTimeoutId = window.setTimeout(() => {
      followUpSpeechTimeoutId = null;
      playSegments(segments, requestId, segmentIndex + 1, false, callbacks);
    }, segment.gapAfter);
  };

  utterance.onerror = (event) => {
    if (requestId !== activeSpeechRequestId) {
      return;
    }

    if (event.error === "canceled") {
      return;
    }

    if (didRetry) {
      callbacks.onEnd?.();
      return;
    }

    clearRetrySpeechTimeout();
    retrySpeechTimeoutId = window.setTimeout(() => {
      retrySpeechTimeoutId = null;
      playSegments(segments, requestId, segmentIndex, true, callbacks);
    }, 180);
  };

  scheduleSpeak(utterance, requestId, segment.delay, () => {
    if (didRetry || requestId !== activeSpeechRequestId) {
      return;
    }

    clearRetrySpeechTimeout();
    retrySpeechTimeoutId = window.setTimeout(() => {
      retrySpeechTimeoutId = null;
      playSegments(segments, requestId, segmentIndex, true, callbacks);
    }, 180);
  });
}

export function speakSequence(segments, callbacks = {}) {
  if (!hasSpeechSupport()) {
    return;
  }

  const normalizedSegments = segments
    .map(normalizeSegment)
    .filter(Boolean);

  if (!normalizedSegments.length) {
    return;
  }

  primeVoices();
  const requestId = startSpeechRequest();
  playSegments(normalizedSegments, requestId, 0, false, callbacks);
}

export function speakPhrase(message, lang = "en-US", rate = 0.82, pitch = 1) {
  if (!message) {
    return;
  }

  speakSequence([{ message, lang, rate, pitch }]);
}

export function speakWordWithPhonics(word, phonics) {
  if (!word) {
    return;
  }

  const segments = [
    {
      message: word,
      ...CHILD_SPEECH_PRESETS.englishWord,
    },
  ];

  if (phonics) {
    segments.push({
      message: phonics,
      ...CHILD_SPEECH_PRESETS.thaiPhonics,
    });
  }

  speakSequence(segments);
}

function hasNarrationContent(narration) {
  if (Array.isArray(narration)) {
    return narration.some((segment) => cleanSpeechText(segment?.message));
  }

  return Boolean(cleanSpeechText(narration));
}

function toNarrationSegments(narration) {
  if (Array.isArray(narration)) {
    return narration;
  }

  return [
    {
      message: narration,
      ...CHILD_SPEECH_PRESETS.englishInstruction,
    },
  ];
}

export function useNarration(narration, options = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { autoPlay = true } = options;
  const isAvailable = hasSpeechSupport() && hasNarrationContent(narration);
  const replay = useCallback(() => {
    if (!hasNarrationContent(narration) || !hasSpeechSupport()) {
      return;
    }

    speakSequence(
      toNarrationSegments(narration),
      {
        onEnd: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
      },
    );
  }, [narration]);

  useEffect(() => {
    if (!hasNarrationContent(narration) || !hasSpeechSupport()) {
      return undefined;
    }

    if (autoPlay) {
      replay();
    }

    return () => {
      setIsSpeaking(false);
      stopSpeechRequest();
    };
  }, [autoPlay, narration, replay]);

  return {
    isAvailable,
    isSpeaking,
    replay,
  };
}
