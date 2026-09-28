import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const backupDirectory = resolve(root, "backups");
const outputPath = resolve(backupDirectory, "content-library.pre-supabase.json");

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  root,
  server: { middlewareMode: true },
});

try {
  const { buildSubjectLevels, defaultLibrary } = await server.ssrLoadModule(
    "/src/data/contentLibrary.js",
  );
  const snapshot = structuredClone(defaultLibrary);
  const serializedLibrary = JSON.stringify(snapshot);
  const subjectCount = snapshot.length;
  const wordCount = snapshot.reduce(
    (total, subject) => total + (subject.words?.length ?? 0),
    0,
  );
  const levelCount = snapshot.reduce(
    (total, subject) => total + buildSubjectLevels(subject).length,
    0,
  );
  const checksum = createHash("sha256")
    .update(serializedLibrary)
    .digest("hex");

  await mkdir(backupDirectory, { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        checksum: `sha256:${checksum}`,
        counts: {
          levels: levelCount,
          subjects: subjectCount,
          words: wordCount,
        },
        library: snapshot,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    JSON.stringify({
      backup: outputPath,
      checksum: `sha256:${checksum}`,
      levels: levelCount,
      subjects: subjectCount,
      words: wordCount,
    }),
  );
} finally {
  await server.close();
}
