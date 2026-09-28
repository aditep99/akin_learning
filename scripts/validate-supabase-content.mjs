import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEFAULT_CURRICULUM_ID,
  DEFAULT_GRADE_BAND_ID,
  getLevelSurfaceMetadata,
  validateLibraryPayload,
  withVersionedLevelPayload,
} from "../src/data/contentPayload.js";

const projectRoot = resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

async function read(relativePath) {
  const path = resolve(projectRoot, relativePath);
  if (!existsSync(path)) {
    errors.push(`${relativePath}: file is missing`);
    return "";
  }
  return readFile(path, "utf8");
}

const backup = JSON.parse(
  await readFile(
    resolve(projectRoot, "backups", "content-library.pre-supabase.json"),
    "utf8",
  ),
);
const library = (backup.library || []).map((subject) => ({
  ...subject,
  levels: (subject.levels || []).map(withVersionedLevelPayload),
}));
errors.push(...validateLibraryPayload(library));

const identityKeys = new Set();
const surfaceKeys = new Set();
library.forEach((subject) => {
  (subject.levels || []).forEach((level) => {
    const trackId = level.trackId || "";
    const identity = [
      DEFAULT_CURRICULUM_ID,
      DEFAULT_GRADE_BAND_ID,
      subject.id,
      trackId,
      level.levelNumber,
    ].join(":");
    const surface = getLevelSurfaceMetadata(level);
    const surfaceKey = `${subject.id}:${trackId}:${surface.surfaceId}`;

    if (identityKeys.has(identity)) {
      errors.push(`duplicate level identity: ${identity}`);
    }
    if (surfaceKeys.has(surfaceKey)) {
      errors.push(`duplicate surface in scope: ${surfaceKey}`);
    }
    identityKeys.add(identity);
    surfaceKeys.add(surfaceKey);

    if (JSON.stringify(level).length > 500_000) {
      errors.push(`level ${level.id}: payload exceeds 500KB`);
    }
  });
});

const migration002 = await read("supabase/migrations/002_curriculum_and_content_versions.sql");
const migration003 = await read("supabase/migrations/003_learner_progress.sql");
const setup = await read("SUPABASE_SETUP.md");
const contentService = await read("src/services/contentService.js");
const sourceCode = await read("src/lib/supabase.js");
const artifactPath = resolve(
  projectRoot,
  "docs",
  "AkinLearning-Supabase-System-Design.docx",
);
const artifactScriptPath = resolve(
  projectRoot,
  "scripts",
  "create-system-design-doc.py",
);

if (!existsSync(artifactPath) || (await readFile(artifactPath)).length < 10_000) {
  errors.push("docs/AkinLearning-Supabase-System-Design.docx: artifact is missing or unexpectedly small");
}
if (!existsSync(artifactScriptPath)) {
  errors.push("scripts/create-system-design-doc.py: retained-template generator is missing");
}

const requiredSqlTerms = [
  "public.curricula",
  "public.grade_bands",
  "public.content_releases",
  "public.level_revisions",
  "public.content_release_levels",
  "publish_content_release",
  "Public reads published levels",
];
requiredSqlTerms.forEach((term) => {
  if (!migration002.includes(term)) errors.push(`002 migration missing ${term}`);
});
[
  "public.learner_profiles",
  "public.learner_subject_progress",
  "public.learner_skill_mastery",
  "public.learning_sessions",
  "public.learning_attempts",
  "public.reward_ledger",
  "record_learning_attempt",
  "client_event_id",
  "session_revision_conflict",
].forEach((term) => {
  if (!migration003.includes(term)) errors.push(`003 migration missing ${term}`);
});

[
  "loadLibrary({",
  "validateLibraryPayload",
  "last validated published content",
  "createLevelDraft",
  "publishLevelRevision",
  "getCurricula",
  "getGradeBands",
].forEach((term) => {
  if (!contentService.includes(term)) errors.push(`contentService missing ${term}`);
});

if (/VITE_[A-Z0-9_]*SERVICE_ROLE|service_role/i.test(sourceCode)) {
  errors.push("browser Supabase client contains a service-role credential reference");
}

if (!setup.includes("published release") || !setup.includes("service-role")) {
  warnings.push("SUPABASE_SETUP.md should document published release and service-role boundaries");
}

if (backup.counts?.subjects !== library.length) {
  errors.push(`backup subject count mismatch: ${backup.counts?.subjects} vs ${library.length}`);
}

const actualWords = library.reduce(
  (total, subject) => total + (subject.words?.length || 0),
  0,
);
if (backup.counts?.words !== actualWords) {
  errors.push(`backup word count mismatch: ${backup.counts?.words} vs ${actualWords}`);
}

const result = {
  status: errors.length > 0 ? "failed" : "ok",
  source: "bundled-library-static-audit",
  curriculumId: DEFAULT_CURRICULUM_ID,
  gradeBandId: DEFAULT_GRADE_BAND_ID,
  counts: {
    subjects: library.length,
    words: actualWords,
    levels: identityKeys.size,
  },
  checksum: backup.checksum,
  checks: [
    "versioned-payload-schema",
    "curriculum-grade-identity",
    "surface-uniqueness",
    "publish-and-fallback-runtime",
    "learner-progress-migrations",
    "browser-credential-boundary",
  ],
  warnings,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length > 0) process.exitCode = 1;
