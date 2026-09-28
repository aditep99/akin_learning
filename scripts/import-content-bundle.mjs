import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
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
const args = process.argv.slice(2);
const getArg = (name, fallback = "") => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || fallback : fallback;
};
const dryRun = args.includes("--dry-run");
const publish = args.includes("--publish");
const filePath = resolve(
  root,
  getArg("--file", "backups/content-library.pre-supabase.json"),
);
const input = JSON.parse(await readFile(filePath, "utf8"));
const curriculum = input.curriculum || {
  id: getArg("--curriculum", DEFAULT_CURRICULUM_ID),
  code: getArg("--curriculum", DEFAULT_CURRICULUM_ID),
  name: "AkinLearning Foundation Library",
  languageCode: "en",
  countryCode: "TH",
  version: "1.0.0",
  provisional: true,
};
const gradeBand = input.gradeBand || {
  id: getArg("--grade", DEFAULT_GRADE_BAND_ID),
  curriculumId: curriculum.id,
  code: getArg("--grade", DEFAULT_GRADE_BAND_ID),
  label: "Foundation · Kindergarten to Primary 2",
  ordinal: 1,
};
const version = getArg("--version", input.release?.version || "1.0.0");
const sourceLibrary = input.library || input;
const library = (sourceLibrary || []).map((subject) => ({
  ...subject,
  levels: (subject.levels || []).map(withVersionedLevelPayload),
}));
const findings = validateLibraryPayload(library);

if (findings.length > 0) {
  console.error(JSON.stringify({ status: "failed", findings }, null, 2));
  process.exit(1);
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

const sourceChecksum = input.checksum || `sha256:${createHash("sha256")
  .update(stableJson(library))
  .digest("hex")}`;
const releaseId = uuid(`${curriculum.id}:${gradeBand.id}:${sourceChecksum}`);
const warnings = [];

function uuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${
    ["8", "9", "a", "b"][parseInt(hex[16], 16) % 4]
  }${hex.slice(17, 20)}-${hex.slice(20)}`;
}

if (JSON.stringify(library).includes("/src/assets/")) {
  warnings.push("Some image paths are local source paths; upload public assets before publishing this bundle.");
}

const levels = [];
library.forEach((subject) => {
  (subject.levels || []).forEach((sourceLevel, index) => {
    const payload = withVersionedLevelPayload(sourceLevel);
    const id = sourceLevel.id || `${subject.id}-level-${index + 1}`;
    const revisionId = uuid(`${id}:${releaseId}`);
    const surface = getLevelSurfaceMetadata(payload);
    levels.push({ subject, sourceLevel, payload, id, revisionId, surface });
  });
});

const preview = {
  status: "dry-run-ok",
  file: filePath,
  curriculumId: curriculum.id,
  gradeBandId: gradeBand.id,
  version,
  releaseId,
  checksum: sourceChecksum,
  counts: {
    subjects: library.length,
    words: library.reduce((total, subject) => total + (subject.words?.length || 0), 0),
    levels: levels.length,
  },
  warnings,
  publishRequested: publish,
};

if (dryRun) {
  console.log(JSON.stringify(preview, null, 2));
  process.exit(0);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or use --dry-run.",
  );
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function upsert(table, rows, chunkSize = 100) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const { error } = await client.from(table).upsert(rows.slice(index, index + chunkSize));
    if (error) throw error;
  }
}

await upsert("curricula", [{
  id: curriculum.id,
  code: curriculum.code || curriculum.id,
  name: curriculum.name,
  language_code: curriculum.languageCode || "en",
  country_code: curriculum.countryCode || "TH",
  version: curriculum.version || version,
  provisional: curriculum.provisional ?? true,
  active: curriculum.active ?? true,
}]);
await upsert("grade_bands", [{
  id: gradeBand.id,
  curriculum_id: curriculum.id,
  code: gradeBand.code || gradeBand.id,
  label: gradeBand.label || gradeBand.code || gradeBand.id,
  ordinal: gradeBand.ordinal || 0,
  active: gradeBand.active ?? true,
}]);
await upsert("subjects", library.map((subject, index) => ({
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
})));
await upsert("words", library.flatMap((subject) => (subject.words || []).map((word, index) => ({
  id: word.id,
  subject_id: subject.id,
  word: word.word,
  emoji: word.emoji || "✨",
  phonics: word.phonics || "",
  pronunciation_guide: word.pronunciation?.guide || "",
  pronunciation_ipa: word.pronunciation?.ipa || "",
  translation: word.translation || "",
  image_url: word.image?.startsWith("http") ? word.image : null,
  sort_order: index,
  active: true,
}))));
if (publish) {
  const { error: archiveError } = await client
    .from("content_releases")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("curriculum_id", curriculum.id)
    .eq("grade_band_id", gradeBand.id)
    .eq("status", "published")
    .neq("id", releaseId);
  if (archiveError) throw archiveError;
}
await upsert("content_releases", [{
  id: releaseId,
  curriculum_id: curriculum.id,
  grade_band_id: gradeBand.id,
  version,
  checksum: sourceChecksum,
  schema_version: CONTENT_SCHEMA_VERSION,
  status: publish ? "published" : "draft",
  release_notes: input.release?.releaseNotes || "Bulk-imported validated content bundle.",
  published_at: publish ? new Date().toISOString() : null,
}]);
await upsert("levels", levels.map(({ subject, sourceLevel, payload, id, revisionId, surface }) => ({
  id,
  subject_id: subject.id,
  curriculum_id: curriculum.id,
  grade_band_id: gradeBand.id,
  track_id: sourceLevel.trackId || payload.trackId || "",
  level_number: sourceLevel.levelNumber || 1,
  label: sourceLevel.label || `Level ${sourceLevel.levelNumber || 1}`,
  mode: sourceLevel.mode || payload.mode || null,
  theme_label: sourceLevel.themeLabel || null,
  payload,
  active: publish,
  surface_id: surface.surfaceId || null,
  surface_kind: surface.surfaceKind || null,
  surface_variant: surface.surfaceVariant || null,
  renderer_key: surface.rendererKey || null,
  answer_representation: surface.answerRepresentation || null,
  schema_version: CONTENT_SCHEMA_VERSION,
  published_revision_id: null,
  release_id: releaseId,
})));
await upsert("level_revisions", levels.map(({ payload, id, revisionId }) => ({
  id: revisionId,
  level_id: id,
  revision_number: 1,
  schema_version: CONTENT_SCHEMA_VERSION,
  status: publish ? "published" : "draft",
  payload,
  checksum: `sha256:${createHash("sha256").update(stableJson(payload)).digest("hex")}`,
  published_at: publish ? new Date().toISOString() : null,
})));
await upsert("levels", levels.map(({ id, revisionId }) => ({
  id,
  published_revision_id: revisionId,
  release_id: releaseId,
})));
await upsert("content_release_levels", levels.map(({ id, revisionId }) => ({
  release_id: releaseId,
  level_id: id,
  revision_id: revisionId,
})));

console.log(JSON.stringify({ ...preview, status: publish ? "imported-and-published" : "imported-draft" }, null, 2));
