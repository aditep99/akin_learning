/**
 * Versioned content payload contract shared by the bundled library, the
 * Supabase import pipeline, and the runtime loader.
 *
 * Content data is intentionally validated at the boundary. Renderers and
 * learning engines remain owned by the application code; a remote payload
 * may select a known renderer, but it may not inject executable code.
 */

export const CONTENT_SCHEMA_VERSION = 1;
export const DEFAULT_CURRICULUM_ID = "akin-default";
export const DEFAULT_GRADE_BAND_ID = "foundation-k-p2";
export const DEFAULT_LOCALE = "en";

export const CONTENT_RELEASE_STATUSES = new Set([
  "draft",
  "review",
  "published",
  "archived",
]);

export const LEVEL_REVISION_STATUSES = new Set([
  "draft",
  "review",
  "published",
  "archived",
]);

const SURFACE_KINDS = new Set(["single-skill", "composite-review"]);

const REQUIRED_SURFACE_FIELDS = [
  "surfaceId",
  "surfaceKind",
  "surfaceVariant",
  "rendererKey",
  "answerRepresentation",
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getSurfaceFromLevel(level = {}) {
  return level.surface && typeof level.surface === "object"
    ? {
        surfaceId: level.surface.surfaceId,
        surfaceKind: level.surface.surfaceKind,
        surfaceVariant: level.surface.surfaceVariant,
        rendererKey: level.surface.rendererKey,
        answerRepresentation: level.surface.answerRepresentation,
      }
    : {
        surfaceId: level.surfaceId,
        surfaceKind: level.surfaceKind,
        surfaceVariant: level.surfaceVariant,
        rendererKey: level.rendererKey,
        answerRepresentation: level.answerRepresentation,
      };
}

export function getLevelSurfaceMetadata(level = {}) {
  const surface = getSurfaceFromLevel(level);

  return {
    surfaceId: surface.surfaceId || "",
    surfaceKind: surface.surfaceKind || "",
    surfaceVariant: surface.surfaceVariant || "",
    rendererKey: surface.rendererKey || "",
    answerRepresentation: surface.answerRepresentation || "",
  };
}

export function withVersionedLevelPayload(level = {}) {
  const surface = getLevelSurfaceMetadata(level);

  return {
    schemaVersion: Number(level.schemaVersion) || CONTENT_SCHEMA_VERSION,
    surface,
    mode: level.mode || level.canonicalMode || null,
    exercises: Array.isArray(level.exercises) ? level.exercises : [],
    wordRefs: Array.isArray(level.wordRefs)
      ? level.wordRefs
      : collectWordReferences(level),
    ...level,
    schemaVersion: Number(level.schemaVersion) || CONTENT_SCHEMA_VERSION,
    surface,
  };
}

function collectWordReferences(value) {
  const ids = new Set();

  function visit(candidate) {
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }

    if (!candidate || typeof candidate !== "object") {
      return;
    }

    if (
      typeof candidate.id === "string" &&
      ("word" in candidate || "translation" in candidate || "emoji" in candidate)
    ) {
      ids.add(candidate.id);
    }

    Object.values(candidate).forEach(visit);
  }

  visit(value);
  return [...ids];
}

export function validateSurfaceMetadata(surface, context = "level") {
  const findings = [];

  if (!surface || typeof surface !== "object") {
    return [`${context}: surface metadata is missing`];
  }

  for (const field of REQUIRED_SURFACE_FIELDS) {
    if (!isNonEmptyString(surface[field])) {
      findings.push(`${context}: surface.${field} must be a non-empty string`);
    }
  }

  if (surface.surfaceKind && !SURFACE_KINDS.has(surface.surfaceKind)) {
    findings.push(
      `${context}: unsupported surfaceKind ${JSON.stringify(surface.surfaceKind)}`,
    );
  }

  return findings;
}

export function validateLevelPayload(level, context = "level") {
  const findings = [];

  if (!level || typeof level !== "object") {
    return [`${context}: level payload must be an object`];
  }

  const schemaVersion = Number(level.schemaVersion);
  if (schemaVersion !== CONTENT_SCHEMA_VERSION) {
    findings.push(
      `${context}: schemaVersion must be ${CONTENT_SCHEMA_VERSION}, received ${JSON.stringify(level.schemaVersion)}`,
    );
  }

  findings.push(
    ...validateSurfaceMetadata(
      getSurfaceFromLevel(level),
      context,
    ),
  );

  if (!isNonEmptyString(level.mode) && !Array.isArray(level.exercises)) {
    findings.push(`${context}: mode or exercises is required`);
  }

  if (level.exercises !== undefined && !Array.isArray(level.exercises)) {
    findings.push(`${context}: exercises must be an array when present`);
  }

  if (level.wordRefs !== undefined && !Array.isArray(level.wordRefs)) {
    findings.push(`${context}: wordRefs must be an array when present`);
  }

  return findings;
}

export function validateLevelIdentity(level, context = "level") {
  const findings = [];

  if (!isNonEmptyString(level?.id)) {
    findings.push(`${context}: id is required`);
  }

  if (!Number.isInteger(Number(level?.levelNumber)) || Number(level.levelNumber) < 1) {
    findings.push(`${context}: levelNumber must be a positive integer`);
  }

  return findings;
}

export function validateLibraryPayload(library, { subjectContext = "subject" } = {}) {
  const findings = [];
  const seenSubjects = new Set();
  const seenLevels = new Set();

  if (!Array.isArray(library) || library.length === 0) {
    return ["library: at least one subject is required"];
  }

  library.forEach((subject, subjectIndex) => {
    const subjectPath = `${subjectContext}[${subjectIndex}]`;

    if (!isNonEmptyString(subject?.id)) {
      findings.push(`${subjectPath}: id is required`);
    } else if (seenSubjects.has(subject.id)) {
      findings.push(`${subjectPath}: duplicate subject id ${subject.id}`);
    } else {
      seenSubjects.add(subject.id);
    }

    const levels = Array.isArray(subject?.levels) ? subject.levels : [];
    levels.forEach((level, levelIndex) => {
      const levelPath = `${subjectPath}.levels[${levelIndex}]`;
      findings.push(...validateLevelIdentity(level, levelPath));
      findings.push(...validateLevelPayload(level, levelPath));

      if (seenLevels.has(level?.id)) {
        findings.push(`${levelPath}: duplicate global level id ${level.id}`);
      } else if (level?.id) {
        seenLevels.add(level.id);
      }
    });
  });

  return findings;
}

export function validateRemoteRelease(release) {
  const findings = [];

  if (!release || typeof release !== "object") {
    return ["release: release metadata is missing"];
  }

  if (!isNonEmptyString(release.id)) {
    findings.push("release: id is required");
  }

  if (!isNonEmptyString(release.curriculumId)) {
    findings.push("release: curriculumId is required");
  }

  if (!isNonEmptyString(release.gradeBandId)) {
    findings.push("release: gradeBandId is required");
  }

  if (!isNonEmptyString(release.checksum)) {
    findings.push("release: checksum is required");
  }

  if (release.status && !CONTENT_RELEASE_STATUSES.has(release.status)) {
    findings.push(`release: unsupported status ${release.status}`);
  }

  return findings;
}

export function toSurfaceColumns(level = {}) {
  const surface = getLevelSurfaceMetadata(level);

  return {
    surface_id: surface.surfaceId || null,
    surface_kind: surface.surfaceKind || null,
    surface_variant: surface.surfaceVariant || null,
    renderer_key: surface.rendererKey || null,
    answer_representation: surface.answerRepresentation || null,
    schema_version: Number(level.schemaVersion) || CONTENT_SCHEMA_VERSION,
  };
}

export function toCamelSurface(level = {}) {
  const surface = getLevelSurfaceMetadata(level);

  return {
    surfaceId: surface.surfaceId,
    surfaceKind: surface.surfaceKind,
    surfaceVariant: surface.surfaceVariant,
    rendererKey: surface.rendererKey,
    answerRepresentation: surface.answerRepresentation,
    schemaVersion: Number(level.schemaVersion) || CONTENT_SCHEMA_VERSION,
  };
}
