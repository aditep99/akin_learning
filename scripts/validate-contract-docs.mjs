import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

const requiredFiles = [
  "AGENTS.md",
  "DESIGN.md",
  "UX-CONTRACT.md",
  "CONTENT-CONTRACT.md",
  "SUPABASE_SETUP.md",
];
const validatorPath = resolve(projectRoot, "scripts", "validate-contract-docs.mjs");
const correctnessValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-mission-correctness.mjs",
);
const surfaceValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-mission-surface-contract.mjs",
);
const semanticManifestPath = resolve(
  projectRoot,
  "scripts",
  "fixtures",
  "mission-semantic-cases.mjs",
);
const migrationValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-challenge-migrations.mjs",
);
const worldsEntryValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-worlds-entry.mjs",
);
const contentPayloadValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-content-payload.mjs",
);
const supabaseContentValidatorPath = resolve(
  projectRoot,
  "scripts",
  "validate-supabase-content.mjs",
);
const importContentPath = resolve(
  projectRoot,
  "scripts",
  "import-content-bundle.mjs",
);
const contentMigrationPath = resolve(
  projectRoot,
  "supabase",
  "migrations",
  "002_curriculum_and_content_versions.sql",
);
const learnerMigrationPath = resolve(
  projectRoot,
  "supabase",
  "migrations",
  "003_learner_progress.sql",
);
const systemDesignArtifactPath = resolve(
  projectRoot,
  "docs",
  "AkinLearning-Supabase-System-Design.docx",
);
const requiredHeadings = {
  "AGENTS.md": [
    "# AkinLearning Agent and Developer Guide",
    "## Project boundary",
    "## Source-of-truth precedence",
    "## Scope guardrails",
    "## Interaction and accessibility rules",
    "## Editing workflow",
    "## Verification commands",
  ],
  "DESIGN.md": [
    "# AkinLearning Design System",
    "## Overview",
    "## Colors",
    "## Typography",
    "## Layout",
    "## Elevation & Depth",
    "## Shapes",
    "## Components",
    "## Do's and Don'ts",
    "## Change log",
  ],
  "UX-CONTRACT.md": [
    "# AkinLearning UX Contract",
    "## Product boundaries",
    "## Primary child learning flow",
    "## Secondary child paths",
    "## Parent and teacher flows",
    "## Canonical operation ledger",
    "## State and feedback contract",
    "## Persistence and data integrity",
    "## Locale, accessibility, and document orientation",
    "## Definition of done for future UI changes",
    "## Change log",
  ],
  "CONTENT-CONTRACT.md": [
    "# AkinLearning Content Contract",
    "## Purpose and authority",
    "## Audience and learning boundaries",
    "## Question correctness contract",
    "## Mode-specific rules",
    "## Reviewed semantic categories",
    "## Automated verification",
    "## Human review boundary",
    "## Change log",
  ],
  "SUPABASE_SETUP.md": [
    "# AkinLearning Supabase setup",
    "## 1. Apply the schema",
    "## 3. Validate and import content",
    "## 4. Runtime behavior and RLS",
    "## 5. Parent Library and optional sync",
    "## Change log",
  ],
};

const requiredTerms = {
  "AGENTS.md": [
    "D:\\AI\\AkinLearning",
    "DESIGN.md",
    "UX-CONTRACT.md",
    "CONTENT-CONTRACT.md",
    "PROJECT_HANDOFF.md",
    "window.alert",
    "window.confirm",
    "window.prompt",
    "preserve unrelated user changes",
    "Worlds",
    "meaning plus IPA",
    "npm run validate:worlds-entry",
    "npm run validate:mission-correctness",
    "npm run validate:mission-surfaces",
    "npm run validate:contracts",
    "SUPABASE_SETUP.md",
    "npm run validate:supabase-content",
    "npm run import:content -- --dry-run",
    "published release",
    "curriculumId",
    "gradeBandId",
    "client_event_id",
    "service-role",
  ],
  "DESIGN.md": [
    "Akin Atlas",
    "Token ownership/runtime mapping",
    "Runtime token mapping",
    "--color-ink",
    "--color-teal",
    "--color-coral",
    "--color-reward",
    "--color-success",
    "--color-danger",
    "LearningShell",
    "FocusSessionShell",
    "ParentToolShell",
    "English is the default shell locale",
    "prefers-reduced-motion: reduce",
    "AdaptedMind",
    "Worlds is the default child landing surface",
    "meaning + IPA metadata",
    "screen-shell--map-focused",
    "Math Quest count-check states",
    "surfaceId",
    "surfaceKind",
    "surfaceVariant",
    "missionSurfaces.js",
    "write-from-memory",
    "word-repair",
    "spelling-sprint",
    "exact challenge signature",
    "published release",
    "curriculum",
    "grade band",
    "cloud sync",
    "AkinLearning-Supabase-System-Design.docx",
  ],
  "UX-CONTRACT.md": [
    "Source-of-truth and change rules",
    "Discover My Path",
    "Play Today’s Mission",
    "Continue Mission",
    "activeMission",
    "Parent Progress",
    "Parent Library",
    "Supabase",
    "noValidate",
    "window.confirm",
    "local/read-only fallback",
    "document title",
    "CONTENT-CONTRACT.md",
    "Worlds is the default child landing surface",
    "meaning + IPA",
    "mission map",
    "Check Math Quest counts",
    "surfaceId",
    "surfaceKind",
    "surfaceVariant",
    "Mission surface contract",
    "write-from-memory",
    "word-repair",
    "spelling-sprint",
    "exact challenge signature",
    "loadLibrary({ curriculumId, gradeBandId, locale })",
    "releaseId",
    "client_event_id",
    "queued",
    "session_revision_conflict",
    "published release",
    "Local fallback",
  ],
  "CONTENT-CONTRACT.md": [
    "canonical source of truth",
    "No new first-letter selection",
    "Legacy `first-letter-pick`",
    "Sound Bubble Pop",
    "token-bank-limited",
    "spelling-order",
    "everyday culinary grouping",
    "sceneMeta.removedIds",
    "mission-semantic-cases.mjs",
    "256 fixed seeds",
    "surfaceId",
    "surfaceKind",
    "surfaceVariant",
    "missionSurfaces.js",
    "exact challenge signatures",
    "write-from-memory",
    "word-repair",
    "spelling-sprint",
    "subject",
    "challengeId",
    "formal curriculum certification",
    "schemaVersion",
    "curriculum + gradeBand",
    "content_releases",
    "level_revisions",
    "RLS",
    "client_event_id",
  ],
  "SUPABASE_SETUP.md": [
    "# AkinLearning Supabase setup",
    "## 1. Apply the schema",
    "## 3. Validate and import content",
    "## 4. Runtime behavior and RLS",
    "## 5. Parent Library and optional sync",
    "## Change log",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "13",
    "506",
    "92",
    "published release",
    "local fallback",
    "RLS",
    "client_event_id",
    "AkinLearning-Supabase-System-Design.docx",
  ],
};

const semanticTokens = [
  "--color-ink",
  "--color-teal",
  "--color-coral",
  "--color-reward",
  "--color-success",
  "--color-danger",
  "--color-focus",
];

const semanticTokenRoles = [
  ["ink", "--color-ink"],
  ["teal", "--color-teal"],
  ["coral", "--color-coral"],
  ["reward", "--color-reward"],
  ["success", "--color-success"],
  ["danger", "--color-danger"],
  ["focus", "--color-focus"],
];

const errors = [];

function readDoc(name) {
  const path = resolve(projectRoot, name);

  if (!existsSync(path)) {
    errors.push(`${name}: file is missing`);
    return "";
  }

  return readFileSync(path, "utf8");
}

for (const name of requiredFiles) {
  const content = readDoc(name);

  for (const heading of requiredHeadings[name]) {
    if (!content.includes(heading)) {
      errors.push(`${name}: missing required heading "${heading}"`);
    }
  }

  for (const term of requiredTerms[name]) {
    if (!content.includes(term)) {
      errors.push(`${name}: missing required contract term "${term}"`);
    }
  }

  if (/\bTODO\b|\bTBD\b|\[Project name\]|\[Describe /.test(content)) {
    errors.push(`${name}: unresolved template placeholder remains`);
  }
}

if (!existsSync(validatorPath)) {
  errors.push("scripts/validate-contract-docs.mjs: validator file is missing");
}

if (!existsSync(correctnessValidatorPath)) {
  errors.push("scripts/validate-mission-correctness.mjs: correctness validator is missing");
}

if (!existsSync(surfaceValidatorPath)) {
  errors.push("scripts/validate-mission-surface-contract.mjs: mission surface validator is missing");
}

if (!existsSync(semanticManifestPath)) {
  errors.push("scripts/fixtures/mission-semantic-cases.mjs: reviewed semantic manifest is missing");
}

if (!existsSync(migrationValidatorPath)) {
  errors.push("scripts/validate-challenge-migrations.mjs: migration validator is missing");
}

if (!existsSync(worldsEntryValidatorPath)) {
  errors.push("scripts/validate-worlds-entry.mjs: Worlds entry validator is missing");
}

if (!existsSync(contentPayloadValidatorPath)) {
  errors.push("scripts/validate-content-payload.mjs: content payload validator is missing");
}

if (!existsSync(supabaseContentValidatorPath)) {
  errors.push("scripts/validate-supabase-content.mjs: Supabase content validator is missing");
}

if (!existsSync(importContentPath)) {
  errors.push("scripts/import-content-bundle.mjs: content import tool is missing");
}

if (!existsSync(contentMigrationPath)) {
  errors.push("supabase/migrations/002_curriculum_and_content_versions.sql: content migration is missing");
}

if (!existsSync(learnerMigrationPath)) {
  errors.push("supabase/migrations/003_learner_progress.sql: learner migration is missing");
}

if (!existsSync(systemDesignArtifactPath)) {
  errors.push("docs/AkinLearning-Supabase-System-Design.docx: system design artifact is missing");
}

const packagePath = resolve(projectRoot, "package.json");
if (!existsSync(packagePath)) {
  errors.push("package.json: file is missing");
} else {
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    if (packageJson.scripts?.["validate:contracts"] !== "node scripts/validate-contract-docs.mjs") {
      errors.push("package.json: validate:contracts script is missing or changed");
    }
    if (packageJson.scripts?.["validate:mission-correctness"] !== "node scripts/validate-mission-correctness.mjs") {
      errors.push("package.json: validate:mission-correctness script is missing or changed");
    }
    if (packageJson.scripts?.["validate:mission-surfaces"] !== "node scripts/validate-mission-surface-contract.mjs") {
      errors.push("package.json: validate:mission-surfaces script is missing or changed");
    }
    if (packageJson.scripts?.["validate:challenge-migrations"] !== "node scripts/validate-challenge-migrations.mjs") {
      errors.push("package.json: validate:challenge-migrations script is missing or changed");
    }
    if (packageJson.scripts?.["validate:worlds-entry"] !== "node scripts/validate-worlds-entry.mjs") {
      errors.push("package.json: validate:worlds-entry script is missing or changed");
    }
    if (packageJson.scripts?.["validate:content-payload"] !== "node scripts/validate-content-payload.mjs") {
      errors.push("package.json: validate:content-payload script is missing or changed");
    }
    if (packageJson.scripts?.["validate:supabase-content"] !== "node scripts/validate-supabase-content.mjs") {
      errors.push("package.json: validate:supabase-content script is missing or changed");
    }
    if (packageJson.scripts?.["import:content"] !== "node scripts/import-content-bundle.mjs") {
      errors.push("package.json: import:content script is missing or changed");
    }
  } catch (error) {
    errors.push(`package.json: could not parse JSON (${error.message})`);
  }
}

const design = readDoc("DESIGN.md");
const mappingStart = design.indexOf("### Runtime token mapping");
const mappingEnd = design.indexOf("## Colors");
const mapping = mappingStart >= 0
  ? design.slice(mappingStart, mappingEnd >= 0 ? mappingEnd : undefined)
  : "";

for (const token of semanticTokens) {
  if (!mapping.includes(token)) {
    errors.push(`DESIGN.md: token ${token} is not documented in Runtime token mapping`);
  }
}

const mappingTokens = [...mapping.matchAll(/`(--[a-z0-9-]+)`/g)].map(
  ([, token]) => token,
);
const duplicateTokens = mappingTokens.filter(
  (token, index) => mappingTokens.indexOf(token) !== index,
);

if (duplicateTokens.length > 0) {
  errors.push(
    `DESIGN.md: duplicate runtime token rows: ${[...new Set(duplicateTokens)].join(", ")}`,
  );
}

const mappingRows = mapping
  .split(/\r?\n/)
  .filter((line) => /^\|[^|]+\|/.test(line) && !line.includes("DESIGN.md role"));

for (const [role, token] of semanticTokenRoles) {
  const matchingRows = mappingRows.filter(
    (row) => row.includes(`| ${role} |`) && row.includes(`| \`${token}\` |`),
  );

  if (matchingRows.length !== 1) {
    errors.push(
      `DESIGN.md: semantic token mapping for ${role}/${token} must have exactly one row (found ${matchingRows.length})`,
    );
  }
}

const mappedRoles = mappingRows
  .map((row) => row.split("|")[1]?.trim())
  .filter(Boolean);
const duplicateRoles = mappedRoles.filter(
  (role, index) => mappedRoles.indexOf(role) !== index,
);

if (duplicateRoles.length > 0) {
  errors.push(
    `DESIGN.md: duplicate semantic token roles: ${[...new Set(duplicateRoles)].join(", ")}`,
  );
}

const ux = readDoc("UX-CONTRACT.md");
if (!ux.includes("| Operation | Trigger | Pending | Success destination/feedback | Failure recovery | Focus outcome |")) {
  errors.push("UX-CONTRACT.md: canonical operation ledger header is missing or changed");
}

const agents = readDoc("AGENTS.md");
const readingOrder = [
  "`AGENTS.md`",
  "`DESIGN.md`",
  "`UX-CONTRACT.md`",
  "`CONTENT-CONTRACT.md`",
  "`SUPABASE_SETUP.md`",
  "`PROJECT_HANDOFF.md`",
];
let previousReadingIndex = -1;

for (const documentName of readingOrder) {
  const readingIndex = agents.indexOf(documentName, previousReadingIndex + 1);
  if (readingIndex <= previousReadingIndex) {
    errors.push(`AGENTS.md: required reading order is missing or incorrect at ${documentName}`);
    break;
  }
  previousReadingIndex = readingIndex;
}

if (errors.length > 0) {
  console.error(JSON.stringify({ status: "failed", errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        status: "ok",
        files: requiredFiles,
        semanticTokens: semanticTokens.length,
        checks: [
          "required-headings",
          "required-terms",
          "template-placeholders",
          "package-script",
          "mission-surface-validator",
          "token-mapping",
          "token-mapping-uniqueness",
          "operation-ledger",
          "content-contract",
          "semantic-manifest",
          "required-reading-order",
        ],
      },
      null,
      2,
    ),
  );
}
