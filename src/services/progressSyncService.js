import { isSupabaseConfigured, supabase } from "../lib/supabase";

const SYNC_PREFERENCE_KEY = "akinlearning.cloud-progress-preference.v1";
const QUEUE_KEY = "akinlearning.cloud-progress-queue.v1";
const DEVICE_ID_KEY = "akinlearning.cloud-progress-device.v1";

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const value = JSON.parse(storage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getDeviceId() {
  const storage = getStorage();
  const existing = storage?.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const next = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}`;
  storage?.setItem(DEVICE_ID_KEY, next);
  return next;
}

function isReady() {
  return Boolean(isSupabaseConfigured && supabase);
}

export function readCloudSyncPreference() {
  return {
    enabled: false,
    childId: "",
    ...(readJson(SYNC_PREFERENCE_KEY, {}) || {}),
  };
}

export function writeCloudSyncPreference(preference) {
  return writeJson(SYNC_PREFERENCE_KEY, {
    enabled: Boolean(preference?.enabled),
    childId: preference?.childId || "",
  });
}

export function isProgressSyncConfigured() {
  return isReady();
}

export async function listLearnerProfiles() {
  if (!isReady()) return [];

  const { data, error } = await supabase
    .from("learner_profiles")
    .select("id, display_name, locale, sync_enabled, active, local_profile_id, updated_at")
    .eq("active", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLearnerProfile({
  displayName,
  localProfileId = "akin",
  locale = "en",
}) {
  if (!isReady()) throw new Error("Supabase is not configured for cloud progress.");

  const { data, error } = await supabase
    .from("learner_profiles")
    .insert({
      display_name: displayName?.trim() || "Akin",
      local_profile_id: localProfileId,
      locale,
      sync_enabled: false,
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setLearnerSyncEnabled(childId, enabled) {
  if (!isReady()) throw new Error("Supabase is not configured for cloud progress.");

  const { data, error } = await supabase
    .from("learner_profiles")
    .update({ sync_enabled: Boolean(enabled) })
    .eq("id", childId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

function readQueue() {
  const value = readJson(QUEUE_KEY, []);
  return Array.isArray(value) ? value : [];
}

function writeQueue(queue) {
  return writeJson(QUEUE_KEY, queue.slice(-100));
}

function enqueue(event) {
  const queue = readQueue();
  if (queue.some((item) => item.clientEventId === event.clientEventId)) {
    return queue;
  }
  queue.push({ ...event, queuedAt: Date.now() });
  writeQueue(queue);
  return queue;
}

export async function recordCloudAttempt(event) {
  if (!isReady() || !event?.childId || !event?.clientEventId) {
    return { status: "local-only" };
  }

  try {
    const { data, error } = await supabase.rpc("record_learning_attempt", {
      p_event: event,
    });
    if (error) throw error;
    return {
      status: data?.duplicate ? "duplicate" : "synced",
      result: data,
    };
  } catch (error) {
    enqueue(event);
    return { status: "queued", warning: error.message };
  }
}

export async function flushQueuedAttempts(childId) {
  if (!isReady() || !childId) return { flushed: 0, remaining: readQueue().length };

  const queue = readQueue();
  const remaining = [];
  let flushed = 0;

  for (const event of queue) {
    if (event.childId !== childId) {
      remaining.push(event);
      continue;
    }

    try {
      const { error } = await supabase.rpc("record_learning_attempt", {
        p_event: event,
      });
      if (error) throw error;
      flushed += 1;
    } catch {
      remaining.push(event);
    }
  }

  writeQueue(remaining);
  return { flushed, remaining: remaining.length };
}

export async function saveCloudLearningSession({
  sessionId,
  childId,
  levelId,
  revision = 1,
  state,
  status = "active",
  activityIndex = 0,
  releaseId = null,
}) {
  if (!isReady() || !childId || !levelId) return { status: "local-only" };

  const { data, error } = await supabase.rpc("save_learning_session", {
    p_session_id: sessionId || globalThis.crypto?.randomUUID?.(),
    p_learner_id: childId,
    p_level_id: levelId,
    p_revision: revision,
    p_state: state || {},
    p_status: status,
    p_activity_index: activityIndex,
    p_release_id: releaseId,
    p_client_device_id: getDeviceId(),
  });
  if (error) {
    if (error.code === "40001" || error.message?.includes("session_revision_conflict")) {
      return { status: "conflict", warning: "Another device has a newer active mission." };
    }
    return { status: "queued", warning: error.message };
  }
  return { status: "synced", session: data };
}

export async function getLearnerCloudSnapshot(childId) {
  if (!isReady() || !childId) return null;

  const [subject, mastery, sessions, attempts, rewards] = await Promise.all([
    supabase.from("learner_subject_progress").select("*").eq("learner_id", childId),
    supabase.from("learner_skill_mastery").select("*").eq("learner_id", childId),
    supabase.from("learning_sessions").select("*").eq("learner_id", childId).order("updated_at", { ascending: false }).limit(1),
    supabase.from("learning_attempts").select("id, subject_id, level_id, challenge_id, correct, event_at").eq("learner_id", childId).order("event_at", { ascending: false }).limit(50),
    supabase.from("reward_ledger").select("xp_delta, stars_delta, coins_delta, created_at").eq("learner_id", childId).order("created_at", { ascending: false }).limit(50),
  ]);
  const firstError = subject.error || mastery.error || sessions.error || attempts.error || rewards.error;
  if (firstError) throw firstError;
  return {
    subjectProgress: subject.data || [],
    mastery: mastery.data || [],
    activeSession: sessions.data?.[0] || null,
    attempts: attempts.data || [],
    rewards: rewards.data || [],
  };
}
