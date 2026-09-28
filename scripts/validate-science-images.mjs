import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { createServer } from "vite";

const projectRoot = resolve(import.meta.dirname, "..");
const maxBytes = 5 * 1024 * 1024;
const minWidth = 1024;
const minHeight = 768;
const findings = [];

function addFinding(scope, message) {
  findings.push(`${scope}: ${message}`);
}

function resolveAssetPath(source) {
  if (typeof source !== "string" || !source) return null;
  const clean = source.split("?")[0];
  if (clean.startsWith("/src/")) return resolve(projectRoot, clean.slice(1));
  if (clean.startsWith("src/")) return resolve(projectRoot, clean);
  if (clean.startsWith("/assets/")) return resolve(projectRoot, "src", clean.slice("/assets/".length));
  return clean.includes("\\") || clean.includes(":") ? resolve(clean) : null;
}

function readImageDimensions(buffer) {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
    return {
      format: "png",
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  const sofMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  while (offset + 9 < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (!marker || marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (offset + 2 > buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
    if (sofMarkers.has(marker) && segmentLength >= 7) {
      return {
        format: "jpeg",
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  return null;
}

const server = await createServer({
  root: projectRoot,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [{ scienceExercisesSubject }, { sciencePhotoAssets }] = await Promise.all([
    server.ssrLoadModule("/src/data/subjects/scienceExercises.js"),
    server.ssrLoadModule("/src/data/subjects/sciencePhotoAssets.js"),
  ]);
  const assetsById = new Map(sciencePhotoAssets.map((asset) => [asset.assetId, asset]));
  const assetsBySrc = new Map(sciencePhotoAssets.map((asset) => [asset.src, asset]));
  const usedAssetIds = new Set();
  let choiceRows = 0;
  let challengeCount = 0;

  for (const level of scienceExercisesSubject.levels || []) {
    for (const challenge of level.exercises || []) {
      challengeCount += 1;
      const rows = Array.isArray(challenge.choices)
        ? challenge.choices
        : Array.isArray(challenge.items)
          ? challenge.items
          : [];
      const visibleAssetIds = new Set();
      const visiblePaths = new Set();
      const visibleHashes = new Set();
      for (const row of rows) {
        choiceRows += 1;
        if (!row?.image) {
          addFinding(`${level.id}/${challenge.id}/${row?.id || "row"}`, "missing image; emoji fallback would be visible");
          continue;
        }
        const scope = `${level.id}/${challenge.id}/${row.id || "row"}`;
        const path = row.image;
        if (path && visiblePaths.has(path)) {
          addFinding(`${level.id}/${challenge.id}`, `duplicate visible image path (${path})`);
        }
        if (path) visiblePaths.add(path);
        const declaredAsset = row.sciencePhotoAssetId
          ? assetsById.get(row.sciencePhotoAssetId)
          : null;
        const sourceAsset = assetsBySrc.get(path) || null;
        if (row.sciencePhotoAssetId) {
          if (!declaredAsset) {
            addFinding(scope, `unknown sciencePhotoAssetId ${row.sciencePhotoAssetId}`);
          }
        }
        const asset = declaredAsset || sourceAsset;
        if (asset) {
          if (visibleAssetIds.has(asset.assetId)) {
            addFinding(`${level.id}/${challenge.id}`, `duplicate visible asset ID (${asset.assetId})`);
          }
          visibleAssetIds.add(asset.assetId);
          if (asset.sha256 && visibleHashes.has(asset.sha256)) {
            addFinding(`${level.id}/${challenge.id}`, `duplicate visible image hash (${asset.sha256})`);
          }
          if (asset.sha256) visibleHashes.add(asset.sha256);
          usedAssetIds.add(asset.assetId);
          if (row.sciencePhotoAssetId && row.image !== asset.src) {
            addFinding(scope, "image does not match its registry source");
          }
        }
        const localPath = resolveAssetPath(row.image);
        if (localPath && !existsSync(localPath)) {
          addFinding(scope, `image file not found at ${localPath}`);
        }
      }
    }
  }

  const allScienceWords = new Map((scienceExercisesSubject.words || []).map((word) => [word.id, word]));
  for (const asset of sciencePhotoAssets) {
    const scope = `asset/${asset.assetId}`;
    for (const field of ["wordId", "src", "width", "height", "sha256", "license", "creator", "sourceUrl", "reviewedAt"]) {
      if (asset[field] === undefined || asset[field] === null || asset[field] === "") {
        addFinding(scope, `missing ${field}`);
      }
    }
    if (!/^science-[a-z0-9-]+$/.test(asset.assetId || "")) addFinding(scope, "assetId must be stable and namespaced");
    if (!/^(CC0(?: 1\.0)?|Public domain)$/i.test(asset.license || "")) addFinding(scope, `license is not CC0/Public domain (${asset.license || "missing"})`);
    if (!/^https:\/\//.test(asset.sourceUrl || "")) addFinding(scope, "sourceUrl must be an HTTPS provenance URL");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asset.reviewedAt || "")) addFinding(scope, "reviewedAt must use YYYY-MM-DD");
    const word = allScienceWords.get(asset.wordId);
    if (!word) addFinding(scope, `wordId ${asset.wordId} is not present in Science Exercises`);
    const localPath = resolveAssetPath(asset.src);
    if (!localPath || !existsSync(localPath)) {
      addFinding(scope, `local source file is missing (${asset.src})`);
      continue;
    }
    const buffer = await readFile(localPath);
    const dimensions = readImageDimensions(buffer);
    if (!dimensions) {
      addFinding(scope, "file is not a readable PNG/JPEG");
    } else {
      if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
        addFinding(scope, `registry dimensions ${asset.width}x${asset.height} do not match file ${dimensions.width}x${dimensions.height}`);
      }
      if (dimensions.width < minWidth || dimensions.height < minHeight) {
        addFinding(scope, `dimensions must be at least ${minWidth}x${minHeight}`);
      }
    }
    if (buffer.byteLength > maxBytes) addFinding(scope, `file exceeds ${maxBytes} bytes`);
    const hash = createHash("sha256").update(buffer).digest("hex");
    if (hash !== asset.sha256) addFinding(scope, `SHA-256 mismatch (expected ${asset.sha256}, got ${hash})`);
    if (word && word.image !== asset.src) addFinding(scope, `Science word ${word.id} is not wired to this image`);
  }

  for (const asset of sciencePhotoAssets) {
    if (!usedAssetIds.has(asset.assetId)) addFinding(`asset/${asset.assetId}`, "registry asset is not used by a visible Science choice/item");
  }

  const result = {
    status: findings.length ? "failed" : "ok",
    levels: scienceExercisesSubject.levels?.length || 0,
    challenges: challengeCount,
    visibleChoicesOrItems: choiceRows,
    registryAssets: sciencePhotoAssets.length,
    registryAssetsUsed: usedAssetIds.size,
    findings,
  };
  console.log(JSON.stringify(result, null, 2));
  if (findings.length) process.exitCode = 1;
} finally {
  await server.close();
}
