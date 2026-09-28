export const CHALLENGE_HISTORY_STORAGE_KEY =
  "akinlearning.challenge-history.v1";

export const CHALLENGE_HISTORY_LIMITS = {
  recentTargets: 4,
  recentSignatures: 12,
};

function getDefaultStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createEmptyChallengeHistory() {
  return {
    version: 1,
    scopes: {},
  };
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  if (typeof entry.signature !== "string" || !entry.signature) {
    return null;
  }

  return {
    signature: entry.signature,
    targetId:
      typeof entry.targetId === "string" && entry.targetId
        ? entry.targetId
        : "",
    correctIndex:
      Number.isInteger(entry.correctIndex) && entry.correctIndex >= 0
        ? entry.correctIndex
        : null,
    createdAt:
      Number.isFinite(Number(entry.createdAt))
        ? Number(entry.createdAt)
        : Date.now(),
  };
}

export function normalizeChallengeHistory(value) {
  const normalized = createEmptyChallengeHistory();

  if (!value || typeof value !== "object") {
    return normalized;
  }

  const scopes = value.scopes && typeof value.scopes === "object" ? value.scopes : {};

  Object.entries(scopes).forEach(([scopeKey, scopeValue]) => {
    const rawEntries = Array.isArray(scopeValue)
      ? scopeValue
      : Array.isArray(scopeValue?.entries)
        ? scopeValue.entries
        : [];
    const entries = rawEntries.map(normalizeEntry).filter(Boolean);

    if (entries.length > 0) {
      normalized.scopes[scopeKey] = {
        entries: entries.slice(-CHALLENGE_HISTORY_LIMITS.recentSignatures),
        updatedAt: Number(scopeValue?.updatedAt) || Date.now(),
      };
    }
  });

  return normalized;
}

export function readChallengeHistory(storage = getDefaultStorage()) {
  if (!storage) {
    return createEmptyChallengeHistory();
  }

  try {
    const rawValue = storage.getItem(CHALLENGE_HISTORY_STORAGE_KEY);

    if (!rawValue) {
      return createEmptyChallengeHistory();
    }

    return normalizeChallengeHistory(JSON.parse(rawValue));
  } catch {
    return createEmptyChallengeHistory();
  }
}

export function writeChallengeHistory(
  history,
  storage = getDefaultStorage(),
) {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      CHALLENGE_HISTORY_STORAGE_KEY,
      JSON.stringify(normalizeChallengeHistory(history)),
    );
    return true;
  } catch {
    return false;
  }
}

export function getChallengeHistoryEntries(history, scopeKey) {
  const scope = history?.scopes?.[scopeKey];
  const entries = Array.isArray(scope?.entries) ? scope.entries : [];

  return entries.slice(-CHALLENGE_HISTORY_LIMITS.recentSignatures);
}

export function appendChallengeHistory(history, scopeKey, entries) {
  const current = normalizeChallengeHistory(history);
  const nextEntries = Array.isArray(entries)
    ? entries.map(normalizeEntry).filter(Boolean)
    : [];

  if (!scopeKey || nextEntries.length === 0) {
    return current;
  }

  const existingEntries = getChallengeHistoryEntries(current, scopeKey);
  const mergedEntries = [...existingEntries, ...nextEntries].slice(
    -CHALLENGE_HISTORY_LIMITS.recentSignatures,
  );

  return {
    ...current,
    scopes: {
      ...current.scopes,
      [scopeKey]: {
        entries: mergedEntries,
        updatedAt: Date.now(),
      },
    },
  };
}

