import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  CONTENT_SCHEMA_VERSION,
  validateLibraryPayload,
  withVersionedLevelPayload,
} from "../src/data/contentPayload.js";

const projectRoot = resolve(import.meta.dirname, "..");
const argumentIndex = process.argv.indexOf("--file");
const inputPath = argumentIndex >= 0
  ? resolve(projectRoot, process.argv[argumentIndex + 1])
  : resolve(projectRoot, "backups", "content-library.pre-supabase.json");
const input = JSON.parse(await readFile(inputPath, "utf8"));
const sourceLibrary = Array.isArray(input) ? input : input.library;
const library = (sourceLibrary || []).map((subject) => ({
  ...subject,
  levels: (subject.levels || []).map(withVersionedLevelPayload),
}));
const findings = validateLibraryPayload(library);
const levelPayloads = library.flatMap((subject) => subject.levels || []);
const oversized = levelPayloads.filter(
  (level) => JSON.stringify(level).length > 500_000,
);

if (oversized.length > 0) {
  oversized.forEach((level) =>
    findings.push(`level ${level.id}: payload exceeds 500KB import limit`),
  );
}

const result = {
  status: findings.length > 0 ? "failed" : "ok",
  file: inputPath,
  schemaVersion: CONTENT_SCHEMA_VERSION,
  subjects: library.length,
  words: library.reduce((total, subject) => total + (subject.words?.length || 0), 0),
  levels: levelPayloads.length,
  findings,
};

console.log(JSON.stringify(result, null, 2));
if (findings.length > 0) process.exitCode = 1;
