import { defaultLibrary } from "../data/contentLibrary";
import {
  CONTENT_SCHEMA_VERSION,
  DEFAULT_CURRICULUM_ID,
  DEFAULT_GRADE_BAND_ID,
  DEFAULT_LOCALE,
  getLevelSurfaceMetadata,
  validateLevelPayload,
  validateLibraryPayload,
  validateRemoteRelease,
  withVersionedLevelPayload,
} from "../data/contentPayload";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const IMAGE_BUCKET = "word-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const CONTENT_CACHE_KEY = "akinlearning.published-content-cache.v1";

function getLocalStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

async function checksumPayload(payload) {
  const serialized = stableJson(payload);
  const bytes = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function readCachedBundle({ curriculumId, gradeBandId, locale }) {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const cached = JSON.parse(storage.getItem(CONTENT_CACHE_KEY) || "null");
    if (
      !cached ||
      cached.curriculumId !== curriculumId ||
      cached.gradeBandId !== gradeBandId ||
      cached.locale !== locale
    ) {
      return null;
    }

    const findings = [
      ...validateRemoteRelease(cached.release),
      ...validateLibraryPayload(cached.library),
    ];
    return findings.length === 0 ? cached : null;
  } catch {
    return null;
  }
}

function writeCachedBundle(bundle) {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(CONTENT_CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // A full/private storage bucket must never block local play.
  }
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Parent Library is not connected yet.");
  }

  return supabase;
}

function toCamelSubject(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    icon: row.icon,
    description: row.description,
    worldLabel: row.world_label,
    worldTheme: row.world_theme,
    buddyId: row.buddy_id,
    heroAccent: row.hero_accent,
    mapPreviewStyle: row.map_preview_style,
    homeMood: row.home_mood,
    homeOrder: row.home_order,
    contentMode: row.content_mode,
  };
}

function toWord(row) {
  return {
    id: row.id,
    word: row.word,
    emoji: row.emoji,
    phonics: row.phonics,
    pronunciation: {
      guide: row.pronunciation_guide,
      ipa: row.pronunciation_ipa,
    },
    translation: row.translation,
    image: row.image_url || undefined,
    imagePath: row.image_path || undefined,
  };
}

function toCamelCurriculum(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    languageCode: row.language_code,
    countryCode: row.country_code,
    version: row.version,
    provisional: row.provisional,
    active: row.active,
  };
}

function toCamelGradeBand(row) {
  return {
    id: row.id,
    curriculumId: row.curriculum_id,
    code: row.code,
    label: row.label,
    ordinal: row.ordinal,
    active: row.active,
  };
}

function toCamelRelease(row) {
  return {
    id: row.id,
    curriculumId: row.curriculum_id,
    gradeBandId: row.grade_band_id,
    version: row.version,
    checksum: row.checksum,
    schemaVersion: row.schema_version,
    status: row.status,
    releaseNotes: row.release_notes || "",
    publishedAt: row.published_at || null,
  };
}

function hydrateWordReferences(value, wordsById) {
  if (Array.isArray(value)) {
    return value.map((item) => hydrateWordReferences(item, wordsById));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const hydratedEntries = Object.entries(value).map(([key, item]) => [
    key,
    hydrateWordReferences(item, wordsById),
  ]);
  const hydratedValue = Object.fromEntries(hydratedEntries);
  const word = value.id ? wordsById.get(value.id) : null;

  if (!word || !("word" in value || "translation" in value || "phonics" in value)) {
    return hydratedValue;
  }

  return {
    ...hydratedValue,
    ...word,
  };
}

function buildRemoteLibrary(subjectRows, wordRows, levelRows) {
  const wordsBySubject = new Map();
  const levelsBySubject = new Map();

  wordRows.forEach((row) => {
    const word = toWord(row);
    const subjectWords = wordsBySubject.get(row.subject_id) || [];
    subjectWords.push(word);
    wordsBySubject.set(row.subject_id, subjectWords);
  });

  subjectRows.forEach((row) => {
    wordsBySubject.set(row.id, wordsBySubject.get(row.id) || []);
    levelsBySubject.set(row.id, []);
  });

  levelRows.forEach((row) => {
    const subjectWords = wordsBySubject.get(row.subject_id) || [];
    const wordsById = new Map(subjectWords.map((word) => [word.id, word]));
    const level = hydrateWordReferences(row.payload, wordsById);
    const surface = {
      surfaceId: row.surface_id || level.surfaceId || level.surface?.surfaceId || "",
      surfaceKind: row.surface_kind || level.surfaceKind || level.surface?.surfaceKind || "",
      surfaceVariant:
        row.surface_variant || level.surfaceVariant || level.surface?.surfaceVariant || "",
      rendererKey: row.renderer_key || level.rendererKey || level.surface?.rendererKey || "",
      answerRepresentation:
        row.answer_representation ||
        level.answerRepresentation ||
        level.surface?.answerRepresentation ||
        "",
    };
    const subjectLevels = levelsBySubject.get(row.subject_id) || [];

    subjectLevels.push({
      ...level,
      id: row.id,
      label: row.label,
      levelNumber: row.level_number,
      mode: row.mode || level.mode,
      themeLabel: row.theme_label || level.themeLabel,
      schemaVersion: row.schema_version || level.schemaVersion || CONTENT_SCHEMA_VERSION,
      surface,
      surfaceId: surface.surfaceId,
      surfaceKind: surface.surfaceKind,
      surfaceVariant: surface.surfaceVariant,
      rendererKey: surface.rendererKey,
      answerRepresentation: surface.answerRepresentation,
      trackId: row.track_id || level.trackId || "",
    });
    levelsBySubject.set(row.subject_id, subjectLevels);
  });

  return subjectRows.map((row) => {
    const levels = levelsBySubject.get(row.id) || [];
    const subject = {
      ...toCamelSubject(row),
      words: wordsBySubject.get(row.id) || [],
      levels,
    };

    if (row.id !== "math-genius") {
      return subject;
    }

    const localSubject = defaultLibrary.find((item) => item.id === row.id);
    const trackIds = [...new Set(levels.map((level) => level.trackId).filter(Boolean))];
    const tracks = trackIds.length
      ? trackIds.map((trackId) => {
          const localTrack = localSubject?.tracks?.find((track) => track.id === trackId);
          const trackLevels = levels.filter((level) => level.trackId === trackId);
          return {
            ...localTrack,
            id: trackId,
            levels: trackLevels.length ? trackLevels : localTrack?.levels || [],
          };
        })
      : localSubject?.tracks;

    return tracks?.length ? { ...subject, tracks } : subject;
  });
}

function includeGeneratedSubjects(remoteLibrary) {
  const generatedSubjectIds = new Set(["math-genius", "final-test"]);
  const localGeneratedSubjects = defaultLibrary
    .filter((subject) => generatedSubjectIds.has(subject.id))
    .map((subject) => ({
      ...subject,
      levels: (subject.levels || []).map(withVersionedLevelPayload),
      tracks: subject.tracks?.map((track) => ({
        ...track,
        levels: (track.levels || []).map(withVersionedLevelPayload),
      })),
    }));
  const remoteById = new Map(remoteLibrary.map((subject) => [subject.id, subject]));

  localGeneratedSubjects.forEach((localSubject) => {
    const remoteSubject = remoteById.get(localSubject.id);
    if (!remoteSubject || !(remoteSubject.levels?.length || remoteSubject.tracks?.length)) {
      remoteById.set(localSubject.id, localSubject);
      return;
    }

    remoteById.set(localSubject.id, {
      ...localSubject,
      ...remoteSubject,
      // Final Test is a bundled, versioned assessment. Keep its authored
      // local question bank when a remote release only carries metadata.
      levels:
        localSubject.id === "final-test"
          ? localSubject.levels
          : remoteSubject.levels,
      words:
        localSubject.id === "final-test"
          ? localSubject.words
          : remoteSubject.words,
      tracks: remoteSubject.tracks?.length
        ? remoteSubject.tracks
        : localSubject.tracks,
    });
  });

  return [...remoteById.values()].sort(
    (left, right) =>
      (left.homeOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.homeOrder ?? Number.MAX_SAFE_INTEGER),
  );
}

function localLibraryResult(warning = "") {
  return {
    library: defaultLibrary,
    source: "local",
    releaseId: null,
    warning,
  };
}

export async function loadLibrary({
  curriculumId = DEFAULT_CURRICULUM_ID,
  gradeBandId = DEFAULT_GRADE_BAND_ID,
  locale = DEFAULT_LOCALE,
} = {}) {
  if (!supabase) {
    return localLibraryResult(
      "Supabase is not configured. Using the bundled content fallback.",
    );
  }

  try {
    const [curriculumResult, gradeBandResult, releaseResult, subjectsResult, wordsResult, levelsResult] =
      await Promise.all([
        supabase
          .from("curricula")
          .select("*")
          .eq("id", curriculumId)
          .eq("active", true)
          .maybeSingle(),
        supabase
          .from("grade_bands")
          .select("*")
          .eq("id", gradeBandId)
          .eq("curriculum_id", curriculumId)
          .eq("active", true)
          .maybeSingle(),
        supabase
          .from("content_releases")
          .select("*")
          .eq("curriculum_id", curriculumId)
          .eq("grade_band_id", gradeBandId)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      supabase
        .from("subjects")
        .select("*")
        .eq("active", true)
        .order("home_order"),
      supabase
        .from("words")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("levels")
        .select("*")
        .eq("active", true)
        .eq("curriculum_id", curriculumId)
        .eq("grade_band_id", gradeBandId)
        .order("level_number"),
      ]);

    const firstError =
      curriculumResult.error ||
      gradeBandResult.error ||
      releaseResult.error ||
      subjectsResult.error ||
      wordsResult.error ||
      levelsResult.error;

    if (firstError) {
      throw firstError;
    }

    const release = releaseResult.data;
    const releaseMeta = release ? toCamelRelease(release) : null;
    const cache = readCachedBundle({ curriculumId, gradeBandId, locale });

    if (!curriculumResult.data || !gradeBandResult.data || !releaseMeta) {
      if (cache) {
        return {
          library: cache.library,
          source: "local",
          releaseId: cache.release.id,
          warning: "Using the last validated published content cache. Parent editing is read-only until Supabase is connected.",
        };
      }

      return localLibraryResult(
        "Supabase has no complete published release for this curriculum and grade. Using local content.",
      );
    }

    const remoteLibrary = includeGeneratedSubjects(
      buildRemoteLibrary(
        subjectsResult.data || [],
        wordsResult.data || [],
        levelsResult.data || [],
      ),
    );
    const findings = [
      ...validateRemoteRelease(releaseMeta),
      ...validateLibraryPayload(remoteLibrary),
    ];

    if (findings.length > 0) {
      if (cache) {
        return {
          library: cache.library,
          source: "local",
          releaseId: cache.release.id,
          warning: `Published payload failed validation. Using the last validated published content cache (${findings[0]}). Parent editing is read-only.`,
        };
      }

      return localLibraryResult(
        `Published payload failed validation. Using local content. ${findings[0]}`,
      );
    }

    const bundle = {
      curriculumId,
      gradeBandId,
      locale,
      release: releaseMeta,
      library: remoteLibrary,
      cachedAt: new Date().toISOString(),
    };
    writeCachedBundle(bundle);

    return {
      library: remoteLibrary,
      source: "supabase",
      releaseId: releaseMeta.id,
      warning: "",
    };
  } catch (error) {
    const cache = readCachedBundle({ curriculumId, gradeBandId, locale });
    if (cache) {
      return {
        library: cache.library,
        source: "local",
        releaseId: cache.release.id,
        warning: `Supabase is unavailable. Using the last validated published content cache. Parent editing is read-only. ${error.message}`,
      };
    }

    return localLibraryResult(`Supabase is unavailable. ${error.message}`);
  }
}

export async function createSubject(subject) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("subjects")
    .insert({
      id: subject.id,
      name: subject.name,
      category: subject.category || "basic",
      icon: subject.icon || "📚",
      description: subject.description || "",
      world_label: subject.worldLabel || subject.name,
      world_theme: subject.worldTheme || subject.name,
      buddy_id: subject.buddyId || "sun",
      hero_accent: subject.heroAccent || "gold",
      map_preview_style: subject.mapPreviewStyle || "trail",
      home_mood: subject.homeMood || "adventure",
      home_order: subject.homeOrder ?? 999,
      content_mode: subject.contentMode || "words",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...toCamelSubject(data),
    levels: [],
    words: [],
  };
}

export async function createWord(subjectId, word, imageFile) {
  const client = requireSupabase();
  const image = imageFile
    ? await uploadWordImage(subjectId, word.id, imageFile)
    : { path: null, url: null };
  const { data, error } = await client
    .from("words")
    .insert({
      id: word.id,
      subject_id: subjectId,
      word: word.word,
      emoji: word.emoji || "✨",
      phonics: word.phonics || "",
      pronunciation_guide: word.pronunciation?.guide || "",
      pronunciation_ipa: word.pronunciation?.ipa || "",
      translation: word.translation || "",
      image_path: image.path,
      image_url: image.url,
      sort_order: word.sortOrder ?? 999,
    })
    .select()
    .single();

  if (error) {
    if (image.path) {
      await client.storage.from(IMAGE_BUCKET).remove([image.path]);
    }
    throw error;
  }

  return toWord(data);
}

export async function updateWord(subjectId, wordId, word, imageFile) {
  const client = requireSupabase();
  const image = imageFile
    ? await uploadWordImage(subjectId, wordId, imageFile)
    : null;
  const patch = {
    word: word.word,
    emoji: word.emoji || "✨",
    phonics: word.phonics || "",
    pronunciation_guide: word.pronunciation?.guide || "",
    pronunciation_ipa: word.pronunciation?.ipa || "",
    translation: word.translation || "",
  };

  if (image) {
    patch.image_path = image.path;
    patch.image_url = image.url;
  }

  const { data, error } = await client
    .from("words")
    .update(patch)
    .eq("subject_id", subjectId)
    .eq("id", wordId)
    .select()
    .single();

  if (error) {
    if (image?.path) {
      await client.storage.from(IMAGE_BUCKET).remove([image.path]);
    }
    throw error;
  }

  if (image && word.imagePath && word.imagePath !== image.path) {
    await client.storage.from(IMAGE_BUCKET).remove([word.imagePath]);
  }

  return toWord(data);
}

export async function deleteWord(subjectId, word) {
  const client = requireSupabase();
  const { error } = await client
    .from("words")
    .delete()
    .eq("subject_id", subjectId)
    .eq("id", word.id);

  if (error) {
    throw error;
  }

  if (word.imagePath) {
    const { error: storageError } = await client.storage
      .from(IMAGE_BUCKET)
      .remove([word.imagePath]);

    if (storageError) {
      throw storageError;
    }
  }
}

export async function uploadWordImage(subjectId, wordId, file) {
  const client = requireSupabase();

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a PNG, JPEG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${subjectId}/${wordId}-${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(IMAGE_BUCKET).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
  };
}

export async function getCurricula({ includeInactive = false } = {}) {
  const client = requireSupabase();
  let query = client.from("curricula").select("*").order("name");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCamelCurriculum);
}

export async function getGradeBands(
  curriculumId = DEFAULT_CURRICULUM_ID,
  { includeInactive = false } = {},
) {
  const client = requireSupabase();
  let query = client
    .from("grade_bands")
    .select("*")
    .eq("curriculum_id", curriculumId)
    .order("ordinal");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCamelGradeBand);
}

export async function createLevelDraft({
  curriculumId = DEFAULT_CURRICULUM_ID,
  gradeBandId = DEFAULT_GRADE_BAND_ID,
  subjectId,
  trackId = "",
  level,
  releaseId = null,
}) {
  const client = requireSupabase();
  if (!subjectId || !level?.id) {
    throw new Error("subjectId and level.id are required to create a draft.");
  }

  const payload = withVersionedLevelPayload(level.payload || level);
  const findings = validateLevelPayload(payload, `draft:${level.id}`);
  if (findings.length > 0) {
    throw new Error(findings[0]);
  }

  const checksum = await checksumPayload(payload);
  const levelRow = {
    id: level.id,
    subject_id: subjectId,
    curriculum_id: curriculumId,
    grade_band_id: gradeBandId,
    track_id: trackId || level.trackId || "",
    level_number: Number(level.levelNumber) || 1,
    label: level.label || `Level ${level.levelNumber || 1}`,
    mode: level.mode || payload.mode || null,
    theme_label: level.themeLabel || null,
    payload,
    active: false,
    surface_id: getLevelSurfaceMetadata(payload).surfaceId || null,
    surface_kind: getLevelSurfaceMetadata(payload).surfaceKind || null,
    surface_variant: getLevelSurfaceMetadata(payload).surfaceVariant || null,
    renderer_key: getLevelSurfaceMetadata(payload).rendererKey || null,
    answer_representation:
      getLevelSurfaceMetadata(payload).answerRepresentation || null,
    schema_version: CONTENT_SCHEMA_VERSION,
  };

  const { error: levelError } = await client
    .from("levels")
    .upsert(levelRow, { onConflict: "id" });
  if (levelError) throw levelError;

  const { data: previous, error: previousError } = await client
    .from("level_revisions")
    .select("revision_number")
    .eq("level_id", level.id)
    .order("revision_number", { ascending: false })
    .limit(1);
  if (previousError) throw previousError;

  const revisionNumber = Number(previous?.[0]?.revision_number || 0) + 1;
  const { data, error } = await client
    .from("level_revisions")
    .insert({
      level_id: level.id,
      revision_number: revisionNumber,
      schema_version: CONTENT_SCHEMA_VERSION,
      status: "draft",
      payload,
      checksum,
      updated_by: (await client.auth.getUser()).data.user?.id || null,
    })
    .select()
    .single();
  if (error) throw error;

  if (releaseId) {
    const { error: linkError } = await client
      .from("content_release_levels")
      .upsert({ release_id: releaseId, level_id: level.id, revision_id: data.id });
    if (linkError) throw linkError;
  }

  return data;
}

export async function createContentRelease({
  curriculumId = DEFAULT_CURRICULUM_ID,
  gradeBandId = DEFAULT_GRADE_BAND_ID,
  version,
  checksum,
  releaseNotes = "",
}) {
  const client = requireSupabase();
  if (!version || !checksum) {
    throw new Error("version and checksum are required to create a release.");
  }

  const { data, error } = await client
    .from("content_releases")
    .insert({
      curriculum_id: curriculumId,
      grade_band_id: gradeBandId,
      version,
      checksum,
      schema_version: CONTENT_SCHEMA_VERSION,
      status: "draft",
      release_notes: releaseNotes,
      updated_by: (await client.auth.getUser()).data.user?.id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return toCamelRelease(data);
}

export async function publishLevelRevision({ revisionId, releaseId = null }) {
  const client = requireSupabase();
  if (!revisionId && !releaseId) {
    throw new Error("revisionId or releaseId is required to publish content.");
  }

  if (releaseId) {
    const { data, error } = await client.rpc("publish_content_release", {
      p_release_id: releaseId,
    });
    if (error) throw error;
    return data;
  }

  const { data, error } = await client.rpc("publish_level_revision", {
    p_revision_id: revisionId,
  });
  if (error) throw error;
  return data;
}

export function canWriteRemoteContent(source) {
  return source === "supabase" && isSupabaseConfigured;
}
