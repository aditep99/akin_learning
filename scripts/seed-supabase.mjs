import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  CONTENT_SCHEMA_VERSION,
  DEFAULT_CURRICULUM_ID,
  DEFAULT_GRADE_BAND_ID,
  getLevelSurfaceMetadata,
  validateLibraryPayload,
  withVersionedLevelPayload,
} from "../src/data/contentPayload.js";

const root = resolve(import.meta.dirname, "..");
const backupPath = resolve(
  root,
  "backups",
  "content-library.pre-supabase.json",
);
const dryRun = process.argv.includes("--dry-run");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const backup = JSON.parse(await readFile(backupPath, "utf8"));
const sourceLibrary = backup.library;
const publishableLibrary = sourceLibrary.map((subject) => ({
  ...subject,
  levels: (subject.levels || []).map(withVersionedLevelPayload),
}));
const findings = validateLibraryPayload(publishableLibrary);

if (findings.length > 0) {
  throw new Error(
    `Bundled library failed the Supabase payload contract:\n${findings
      .slice(0, 20)
      .join("\n")}`,
  );
}

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        status: "dry-run-ok",
        checksum: backup.checksum,
        counts: backup.counts,
        curriculumId: DEFAULT_CURRICULUM_ID,
        gradeBandId: DEFAULT_GRADE_BAND_ID,
        schemaVersion: CONTENT_SCHEMA_VERSION,
        publishable: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed. Use --dry-run to validate locally.",
  );
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
const imagePaths = new Set();

function collectImagePaths(value) {
  if (Array.isArray(value)) {
    value.forEach(collectImagePaths);
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  Object.entries(value).forEach(([key, item]) => {
    if (
      key === "image" &&
      typeof item === "string" &&
      item.startsWith("/src/assets/") &&
      [".jpg", ".jpeg", ".png", ".webp"].includes(extname(item).toLowerCase())
    ) {
      imagePaths.add(item);
      return;
    }

    collectImagePaths(item);
  });
}

sourceLibrary.forEach(collectImagePaths);

function getMimeType(extension) {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${
    ["8", "9", "a", "b"][parseInt(hex[16], 16) % 4]
  }${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function checksum(value) {
  return `sha256:${createHash("sha256").update(stableJson(value)).digest("hex")}`;
}

const imageMap = new Map();

for (const sourcePath of imagePaths) {
  const localPath = resolve(root, sourcePath.replace(/^\//, ""));
  const extension = extname(localPath).toLowerCase() || ".png";
  const digest = createHash("sha256").update(sourcePath).digest("hex").slice(0, 20);
  const objectPath = `seed/${digest}${extension}`;
  const file = await readFile(localPath);
  const { error: uploadError } = await client.storage
    .from("word-images")
    .upload(objectPath, file, {
      cacheControl: "31536000",
      contentType: getMimeType(extension),
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = client.storage.from("word-images").getPublicUrl(objectPath);
  imageMap.set(sourcePath, { path: objectPath, url: data.publicUrl });
}

function replaceImagePaths(value) {
  if (Array.isArray(value)) return value.map(replaceImagePaths);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === "image" && typeof item === "string" && imageMap.has(item)) {
        return [key, imageMap.get(item).url];
      }
      return [key, replaceImagePaths(item)];
    }),
  );
}

const library = replaceImagePaths(publishableLibrary);
const releaseId = stableUuid(
  `akin-default:foundation-k-p2:${backup.checksum}`,
);

const subjectRows = library.map((subject, index) => ({
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
  home_order: subject.homeOrder ?? index + 1,
  content_mode: subject.levels?.length ? "levels" : "words",
  active: true,
}));

const wordRows = library.flatMap((subject) =>
  (subject.words || []).map((word, index) => {
    const sourceWord = sourceLibrary
      .find((item) => item.id === subject.id)
      ?.words?.find((item) => item.id === word.id);
    const migratedImage = sourceWord?.image
      ? imageMap.get(sourceWord.image)
      : null;

    return {
      id: word.id,
      subject_id: subject.id,
      word: word.word,
      emoji: word.emoji || "✨",
      phonics: word.phonics || "",
      pronunciation_guide: word.pronunciation?.guide || "",
      pronunciation_ipa: word.pronunciation?.ipa || "",
      translation: word.translation || "",
      image_path: migratedImage?.path || null,
      image_url: word.image || null,
      sort_order: index,
      active: true,
    };
  }),
);

const levelRows = [];
const revisionRows = [];
const releaseLevelRows = [];

library.forEach((subject) => {
  (subject.levels || []).forEach((sourceLevel, index) => {
    const level = withVersionedLevelPayload(sourceLevel);
    const id = sourceLevel.id || `${subject.id}-level-${index + 1}`;
    const surface = getLevelSurfaceMetadata(level);
    const revisionId = stableUuid(`${id}:revision:${backup.checksum}`);
    const trackId = sourceLevel.trackId || level.trackId || "";

    levelRows.push({
      id,
      subject_id: subject.id,
      curriculum_id: DEFAULT_CURRICULUM_ID,
      grade_band_id: DEFAULT_GRADE_BAND_ID,
      track_id: trackId,
      level_number: sourceLevel.levelNumber || index + 1,
      label: sourceLevel.label || `Level ${index + 1}`,
      mode: sourceLevel.mode || level.mode || null,
      theme_label: sourceLevel.themeLabel || null,
      payload: level,
      active: true,
      surface_id: surface.surfaceId || null,
      surface_kind: surface.surfaceKind || null,
      surface_variant: surface.surfaceVariant || null,
      renderer_key: surface.rendererKey || null,
      answer_representation: surface.answerRepresentation || null,
      schema_version: CONTENT_SCHEMA_VERSION,
      published_revision_id: null,
      release_id: releaseId,
    });

    revisionRows.push({
      id: revisionId,
      level_id: id,
      revision_number: 1,
      schema_version: CONTENT_SCHEMA_VERSION,
      status: "published",
      payload: level,
      checksum: checksum(level),
      published_at: new Date().toISOString(),
    });
    releaseLevelRows.push({
      release_id: releaseId,
      level_id: id,
      revision_id: revisionId,
    });
  });
});

async function upsertInChunks(table, rows, chunkSize = 100) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await client.from(table).upsert(chunk);
    if (error) throw error;
  }
}

await upsertInChunks("curricula", [
  {
    id: DEFAULT_CURRICULUM_ID,
    code: DEFAULT_CURRICULUM_ID,
    name: "AkinLearning Foundation Library",
    language_code: "en",
    country_code: "TH",
    version: "1.0.0",
    provisional: true,
    active: true,
  },
]);
await upsertInChunks("grade_bands", [
  {
    id: DEFAULT_GRADE_BAND_ID,
    curriculum_id: DEFAULT_CURRICULUM_ID,
    code: DEFAULT_GRADE_BAND_ID,
    label: "Foundation · Kindergarten to Primary 2",
    ordinal: 1,
    active: true,
  },
]);
await upsertInChunks("subjects", subjectRows);
await upsertInChunks("words", wordRows);
const { error: archiveError } = await client
  .from("content_releases")
  .update({ status: "archived", updated_at: new Date().toISOString() })
  .eq("curriculum_id", "akin-default")
  .eq("grade_band_id", "foundation-k-p2")
  .eq("status", "published")
  .neq("id", releaseId);
if (archiveError) throw archiveError;
await upsertInChunks("content_releases", [
  {
    id: releaseId,
    curriculum_id: DEFAULT_CURRICULUM_ID,
    grade_band_id: DEFAULT_GRADE_BAND_ID,
    version: "1.0.0",
    checksum: backup.checksum,
    schema_version: CONTENT_SCHEMA_VERSION,
    status: "published",
    release_notes: "Initial validated snapshot of the bundled AkinLearning library.",
    published_at: new Date().toISOString(),
  },
]);
await upsertInChunks("levels", levelRows);
await upsertInChunks("level_revisions", revisionRows);
await upsertInChunks(
  "levels",
  revisionRows.map((revision) => ({
    id: revision.level_id,
    published_revision_id: revision.id,
    release_id: releaseId,
  })),
);
await upsertInChunks("content_release_levels", releaseLevelRows);

const { error: migrationError } = await client
  .from("content_migrations")
  .upsert({
    id: "versioned-library-v1",
    source_checksum: backup.checksum,
    subject_count: backup.counts.subjects,
    word_count: backup.counts.words,
    level_count: backup.counts.levels,
    migrated_at: new Date().toISOString(),
  });

if (migrationError) throw migrationError;

const [subjectCount, wordCount, levelCount] = await Promise.all([
  client.from("subjects").select("*", { count: "exact", head: true }),
  client.from("words").select("*", { count: "exact", head: true }),
  client
    .from("levels")
    .select("*", { count: "exact", head: true })
    .eq("curriculum_id", DEFAULT_CURRICULUM_ID)
    .eq("grade_band_id", DEFAULT_GRADE_BAND_ID),
]);

for (const result of [subjectCount, wordCount, levelCount]) {
  if (result.error) throw result.error;
}

const actualCounts = {
  levels: levelCount.count,
  subjects: subjectCount.count,
  words: wordCount.count,
};

if (
  actualCounts.subjects < backup.counts.subjects ||
  actualCounts.words < backup.counts.words ||
  actualCounts.levels !== backup.counts.levels
) {
  throw new Error(
    `Count mismatch. Expected at least ${JSON.stringify(
      backup.counts,
    )}, received ${JSON.stringify(actualCounts)}.`,
  );
}

console.log(
  JSON.stringify({
    checksum: backup.checksum,
    counts: actualCounts,
    releaseId,
    images: imageMap.size,
    status: "seeded-and-verified",
  }),
);
