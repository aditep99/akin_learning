export const LEARNING_PROFILE_STORAGE_KEY = "akinlearning.learning-profile.v1";
export const LEARNING_STATE_STORAGE_KEY = "akinlearning.learning-state.v1";
export const PARENT_GATE_STORAGE_KEY = "akinlearning.parent-gate.v1";

const DEFAULT_PROFILE = {
  id: "local-child",
  name: "Akin",
  ageBand: "kindergarten-p2",
  avatarId: "akin",
};

function getStorage(storage) {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  return null;
}

function safeRead(storage, key) {
  const target = getStorage(storage);

  if (!target) {
    return null;
  }

  try {
    const rawValue = target.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function safeWrite(storage, key, value) {
  const target = getStorage(storage);

  if (!target) {
    return false;
  }

  try {
    target.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function createLearningProfile(input = {}) {
  const createdAt = Number.isFinite(input.createdAt)
    ? input.createdAt
    : Date.now();

  return {
    version: 1,
    ...DEFAULT_PROFILE,
    ...input,
    id: input.id || DEFAULT_PROFILE.id,
    name: String(input.name || DEFAULT_PROFILE.name).trim() || DEFAULT_PROFILE.name,
    ageBand: input.ageBand || DEFAULT_PROFILE.ageBand,
    avatarId: input.avatarId || DEFAULT_PROFILE.avatarId,
    createdAt,
  };
}

export function loadLearningProfile(storage) {
  const storedProfile = safeRead(storage, LEARNING_PROFILE_STORAGE_KEY);

  return createLearningProfile(isPlainObject(storedProfile) ? storedProfile : {});
}

export function saveLearningProfile(profile, storage) {
  return safeWrite(
    storage,
    LEARNING_PROFILE_STORAGE_KEY,
    createLearningProfile(profile),
  );
}

export function createEmptyLearningState(input = {}) {
  return {
    version: 1,
    profileId: input.profileId || DEFAULT_PROFILE.id,
    mastery: isPlainObject(input.mastery) ? input.mastery : {},
    diagnostic: {
      status: "not-started",
      questionIndex: 0,
      total: 10,
      ...(isPlainObject(input.diagnostic) ? input.diagnostic : {}),
    },
    mission: {
      status: "idle",
      index: 0,
      completed: 0,
      lastCompletedAt: null,
      ...(isPlainObject(input.mission) ? input.mission : {}),
    },
    activeMission: isPlainObject(input.activeMission)
      ? input.activeMission
      : null,
    sessionStats: {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      lastPlayedAt: null,
      ...(isPlainObject(input.sessionStats) ? input.sessionStats : {}),
    },
    subjectProgress: isPlainObject(input.subjectProgress)
      ? input.subjectProgress
      : {},
    finalTestResults: isPlainObject(input.finalTestResults)
      ? input.finalTestResults
      : {},
    stars: Number.isFinite(input.stars) ? Math.max(0, input.stars) : 12,
    coins: Number.isFinite(input.coins) ? Math.max(0, input.coins) : 35,
  };
}

export function loadLearningState(storage) {
  const storedState = safeRead(storage, LEARNING_STATE_STORAGE_KEY);

  return createEmptyLearningState(
    isPlainObject(storedState) ? storedState : {},
  );
}

export function saveLearningState(state, storage) {
  return safeWrite(
    storage,
    LEARNING_STATE_STORAGE_KEY,
    createEmptyLearningState(state),
  );
}

export function loadParentGate(storage) {
  const gate = safeRead(storage, PARENT_GATE_STORAGE_KEY);

  if (!isPlainObject(gate) || typeof gate.pinHash !== "string") {
    return null;
  }

  return {
    version: 1,
    salt: typeof gate.salt === "string" ? gate.salt : "akinlearning",
    pinHash: gate.pinHash,
    createdAt: Number.isFinite(gate.createdAt) ? gate.createdAt : Date.now(),
  };
}

export function saveParentGate(gate, storage) {
  return safeWrite(storage, PARENT_GATE_STORAGE_KEY, gate);
}

export function clearParentGate(storage) {
  const target = getStorage(storage);

  if (!target) {
    return false;
  }

  try {
    target.removeItem(PARENT_GATE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function fallbackHash(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fallback-${(hash >>> 0).toString(16)}`;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashParentPin(pin, salt = "akinlearning") {
  const value = `${salt}:${String(pin)}`;

  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return bytesToHex(new Uint8Array(digest));
  }

  return fallbackHash(value);
}

export async function createParentGate(pin) {
  const normalizedPin = String(pin).replace(/\D/g, "").slice(0, 4);
  const salt = `akinlearning-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    version: 1,
    salt,
    pinHash: await hashParentPin(normalizedPin, salt),
    createdAt: Date.now(),
  };
}

export async function verifyParentPin(pin, gate) {
  if (!gate?.pinHash || String(pin).replace(/\D/g, "").length !== 4) {
    return false;
  }

  const candidate = await hashParentPin(pin, gate.salt || "akinlearning");
  return candidate === gate.pinHash;
}
