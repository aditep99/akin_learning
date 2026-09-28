import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const projectRoot = resolve(import.meta.dirname, "..");
const maxBytes = 5 * 1024 * 1024;
const minWidth = 1024;
const minHeight = 768;
const expectedFormats = {
  "picture-choice": 8,
  matching: 6,
  "fill-blank": 8,
  "sentence-order": 6,
  reading: 6,
  applied: 6,
};
const findings = [];

function addFinding(scope, message) {
  findings.push(`${scope}: ${message}`);
}

function assert(condition, scope, message) {
  if (!condition) addFinding(scope, message);
}

function resolveAssetPath(source) {
  if (typeof source !== "string" || !source) return null;
  const clean = source.split("?")[0];
  if (clean.startsWith("/src/")) return resolve(projectRoot, clean.slice(1));
  if (clean.startsWith("src/")) return resolve(projectRoot, clean);
  if (clean.startsWith("/assets/")) {
    return resolve(projectRoot, "src", clean.slice("/assets/".length));
  }
  return clean.includes("\\") || clean.includes(":") ? resolve(clean) : null;
}

function readImageDimensions(buffer) {
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer.toString("ascii", 1, 4) === "PNG"
  ) {
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

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function stable(value) {
  return JSON.stringify(value, (_, nested) => {
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) return nested;
    return Object.keys(nested)
      .sort()
      .reduce((result, key) => {
        result[key] = nested[key];
        return result;
      }, {});
  });
}

function semanticSignature(challenge) {
  const removeIdentity = (value, key = "") => {
    if (Array.isArray(value)) return value.map((item) => removeIdentity(item));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([field]) => !["id", "signature", "sourceChallengeId", "unitId", "finalTestQuestionNumber"].includes(field))
        .map(([field, item]) => [field, removeIdentity(item, field)]),
    );
  };
  return stable(removeIdentity(challenge));
}

function validateChoiceChallenge(challenge, scope) {
  assert(Array.isArray(challenge.choices) && challenge.choices.length >= 3, scope, "needs at least three choices");
  const ids = new Set((challenge.choices || []).map((choice) => choice?.id));
  assert(ids.size === (challenge.choices || []).length, scope, "choice IDs are duplicated");
  assert(
    (challenge.choices || []).filter((choice) => choice?.id === challenge.correctChoiceId).length === 1,
    scope,
    "must have exactly one correctChoiceId",
  );
}

function validateChallenge(challenge, level, { runtime = false } = {}) {
  const scope = `${level.id}/${challenge?.id || "question"}`;
  assert(challenge?.type === "final-test", scope, "type must be final-test");
  assert(challenge?.id === `final-test-u${level.levelNumber}-q${String(challenge.finalTestQuestionNumber).padStart(2, "0")}`, scope, "question ID is not stable");
  assert(challenge?.unitId === `unit-${level.levelNumber}`, scope, "unitId is incorrect");
  assert(challenge?.prompt?.en && challenge?.prompt?.th, scope, "English and Thai prompts are required");

  if (["picture-choice", "reading", "applied"].includes(challenge.format)) {
    validateChoiceChallenge(challenge, scope);
  } else if (challenge.format === "matching") {
    const pairs = challenge.pairs || [];
    assert(pairs.length >= 2, scope, "matching needs at least two pairs");
    const leftIds = new Set(pairs.map((pair) => pair?.left?.id));
    const rightIds = new Set(pairs.map((pair) => pair?.right?.id));
    assert(leftIds.size === pairs.length && rightIds.size === pairs.length, scope, "matching IDs are duplicated");
    assert(Object.keys(challenge.answerMap || {}).length === pairs.length, scope, "answerMap must cover every pair");
    pairs.forEach((pair) => assert(challenge.answerMap?.[pair.left.id] === pair.right.id, scope, `answerMap is wrong for ${pair.left.id}`));
    if (runtime && Array.isArray(challenge.matchOptions)) {
      assert(new Set(challenge.matchOptions.map((right) => right?.id)).size === pairs.length, scope, "runtime match options are duplicated");
      assert(challenge.matchOptions.every((right) => rightIds.has(right?.id)), scope, "runtime match option is not in answerMap");
    }
  } else if (challenge.format === "fill-blank") {
    assert(/_{2,}/.test(challenge.sentence || ""), scope, "fill-blank sentence needs one blank");
    assert(Array.isArray(challenge.acceptedAnswers) && challenge.acceptedAnswers.length > 0, scope, "acceptedAnswers is missing");
  } else if (challenge.format === "sentence-order") {
    assert(Array.isArray(challenge.tokens) && challenge.tokens.length >= 2, scope, "sentence-order needs tokens");
    assert(Array.isArray(challenge.correctTokenIds) && challenge.correctTokenIds.length === challenge.tokens.length, scope, "correctTokenIds must cover every token");
    assert(new Set(challenge.tokens.map((token) => token.id)).size === challenge.tokens.length, scope, "token IDs are duplicated");
    if (!runtime) {
      assert(challenge.correctTokenIds.every((id, index) => id === challenge.tokens[index].id), scope, "correctTokenIds must reconstruct target sentence");
    } else {
      const tokenIds = new Set(challenge.tokens.map((token) => token.id));
      assert(challenge.correctTokenIds.every((id) => tokenIds.has(id)), scope, "runtime correctTokenIds reference unknown tokens");
    }
  } else {
    addFinding(scope, `unsupported format ${challenge.format}`);
  }

  if (challenge.photoAssetId) {
    assert(!String(challenge.photoAssetId).includes("data:"), scope, "photoAssetId cannot be a data URI");
  }
}

function validateVisiblePhotoChoices(challenge, assetsById) {
  const scope = challenge.id;
  const rows = challenge.format === "picture-choice" ? challenge.choices || [] : [];
  const ids = new Set();
  const paths = new Set();
  const hashes = new Set();
  rows.forEach((choice) => {
    assert(choice.photoAssetId, `${scope}/${choice.id}`, "picture choices require a local photoAssetId");
    const asset = assetsById.get(choice.photoAssetId);
    assert(asset, `${scope}/${choice.id}`, `unknown photo asset ${choice.photoAssetId}`);
    if (!asset) return;
    assert(!ids.has(asset.assetId), scope, `duplicate visible asset ID ${asset.assetId}`);
    assert(!paths.has(asset.src), scope, `duplicate visible image path ${asset.src}`);
    assert(!hashes.has(asset.sha256), scope, `duplicate visible image hash ${asset.sha256}`);
    ids.add(asset.assetId);
    paths.add(asset.src);
    hashes.add(asset.sha256);
  });
}

const server = await createServer({
  root: projectRoot,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
});

try {
  const [{ finalTestSubject, finalTestLevels }, { finalTestPhotoAssets }, randomizer] = await Promise.all([
    server.ssrLoadModule("/src/data/finalTest/finalTestExercises.js"),
    server.ssrLoadModule("/src/data/finalTest/finalTestPhotoAssets.js"),
    server.ssrLoadModule("/src/data/challengeRandomizer.js"),
  ]);
  const assetsById = new Map(finalTestPhotoAssets.map((asset) => [asset.assetId, asset]));
  const usedAssets = new Set();
  const signatures = new Map();

  assert(finalTestSubject?.id === "final-test", "subject", "subject ID must be final-test");
  assert(finalTestSubject?.levels?.length === 4, "subject", "Final Test must have four Units");
  assert(finalTestLevels.length === 4, "levels", "module must export four Units");

  for (const level of finalTestLevels) {
    const counts = {};
    assert(level.id === `final-test-unit-${level.levelNumber}`, level.id, "level ID is not stable");
    assert(level.exerciseCount === 40 && level.exercises?.length === 40, level.id, "Unit must contain exactly 40 questions");
    for (const challenge of level.exercises || []) {
      counts[challenge.format] = (counts[challenge.format] || 0) + 1;
      validateChallenge(challenge, level);
      validateVisiblePhotoChoices(challenge, assetsById);
      if (challenge.photoAssetId) usedAssets.add(challenge.photoAssetId);
      (challenge.choices || []).forEach((choice) => choice.photoAssetId && usedAssets.add(choice.photoAssetId));
      const signature = semanticSignature(challenge);
      if (signatures.has(signature)) addFinding(`${level.id}/${challenge.id}`, `duplicate semantic question from ${signatures.get(signature)}`);
      else signatures.set(signature, `${level.id}/${challenge.id}`);
    }
    for (const [format, expected] of Object.entries(expectedFormats)) {
      assert(counts[format] === expected, level.id, `${format} count ${counts[format] || 0} != ${expected}`);
    }
  }

  for (const asset of finalTestPhotoAssets) {
    const scope = `asset/${asset.assetId}`;
    for (const field of ["assetId", "wordId", "src", "filePath", "width", "height", "sha256", "license", "creator", "sourceUrl", "reviewedAt"]) {
      assert(asset[field] !== undefined && asset[field] !== null && asset[field] !== "", scope, `missing ${field}`);
    }
    assert(/\.(jpe?g|png|webp)$/i.test(asset.filePath || ""), scope, "Final Test assets must be local raster files");
    assert(!String(asset.src || "").startsWith("data:"), scope, "asset source cannot be a data URI");
    assert(/^(CC0(?: 1\.0)?|Public domain)$/i.test(asset.license || ""), scope, "license must be CC0 or Public domain");
    assert(/^https:\/\//.test(asset.sourceUrl || ""), scope, "sourceUrl must be HTTPS");
    assert(/^\d{4}-\d{2}-\d{2}$/.test(asset.reviewedAt || ""), scope, "reviewedAt must use YYYY-MM-DD");
    const localPath = resolveAssetPath(asset.src) || resolve(projectRoot, asset.filePath);
    assert(localPath && existsSync(localPath), scope, `local file is missing (${localPath || asset.src})`);
    if (!localPath || !existsSync(localPath)) continue;
    const buffer = await readFile(localPath);
    assert(buffer.byteLength <= maxBytes, scope, `file exceeds ${maxBytes} bytes`);
    const dimensions = readImageDimensions(buffer);
    assert(dimensions, scope, "file is not a readable PNG/JPEG");
    if (dimensions) {
      assert(dimensions.width === asset.width && dimensions.height === asset.height, scope, `registry dimensions ${asset.width}x${asset.height} do not match file ${dimensions.width}x${dimensions.height}`);
      assert(dimensions.width >= minWidth && dimensions.height >= minHeight, scope, "dimensions are below the 1024x768 minimum");
    }
    const hash = createHash("sha256").update(buffer).digest("hex");
    assert(hash === asset.sha256, scope, `SHA-256 mismatch (expected ${asset.sha256}, got ${hash})`);
  }
  for (const asset of finalTestPhotoAssets) {
    assert(usedAssets.has(asset.assetId), `asset/${asset.assetId}`, "registry asset is not used by a Final Test question");
  }

  const library = [finalTestSubject];
  let randomizedSessions = 0;
  for (const level of finalTestLevels) {
    for (let seed = 0; seed < 256; seed += 1) {
      const sessionId = `final-test-validator-${level.levelNumber}-${seed}`;
      const first = randomizer.createChallengeSession({
        subjectId: "final-test",
        levelConfig: level,
        library,
        history: [],
        rng: createRng(seed),
        sessionId,
      });
      const second = randomizer.createChallengeSession({
        subjectId: "final-test",
        levelConfig: level,
        library,
        history: [],
        rng: createRng(seed),
        sessionId,
      });
      assert(stable(first) === stable(second), `${level.id}/seed-${seed}`, "session order is not deterministic");
      assert(first?.exercises?.length === 40, `${level.id}/seed-${seed}`, "session does not contain 40 questions");
      const sourceIds = new Set(first?.exercises?.map((exercise) => exercise.sourceChallengeId));
      assert(sourceIds.size === 40, `${level.id}/seed-${seed}`, "session changed authored question IDs");
      first?.exercises?.forEach((challenge) => validateChallenge(challenge, level, { runtime: true }));
      randomizedSessions += 1;
    }
  }

  const { FinalTestGameplayScreen } = await server.ssrLoadModule("/src/screens/FinalTestGameplayScreen.jsx");
  let clueRenderCases = 0;
  for (const level of finalTestLevels) {
    const picture = level.exercises.find((item) => item.format === "picture-choice");
    for (const presentation of ["level", "today"]) {
      for (const wrongAttempts of [0, 1, 2, 3, 4]) {
        const html = renderToStaticMarkup(createElement(FinalTestGameplayScreen, {
          currentChallenge: picture, wrongAttempts, presentation, level: level.levelNumber,
          stepIndex: 1, totalSteps: 40, onPress() {}, onBack() {},
        }));
        const captions = [...html.matchAll(/class="final-test-choice__caption" style="visibility:(hidden|visible)"/g)];
        const expected = wrongAttempts >= 3 ? "visible" : "hidden";
        assert(captions.length === picture.choices.length && captions.every((match) => match[1] === expected),
          `${level.id}/${presentation}/${wrongAttempts}`, "photo captions must unlock together on third error");
        assert(html.includes(`class="final-test-prompt-th" style="visibility:${expected}"`),
          `${level.id}/${presentation}/${wrongAttempts}`, "Thai prompt must follow clue threshold");
        assert(html.includes('aria-label="A:') && html.includes('aria-pressed="false"'),
          level.id, "image choices must retain accessible descriptions and selection state");
        clueRenderCases += 1;
      }
    }
    const broken = { ...picture, choices: picture.choices.map((choice, index) => index === 0 ? { ...choice, photoAssetId: "missing-test-asset" } : choice) };
    const brokenHtml = renderToStaticMarkup(createElement(FinalTestGameplayScreen, { currentChallenge: broken, wrongAttempts: 0 }));
    const visibility = [...brokenHtml.matchAll(/class="final-test-choice__caption" style="visibility:(hidden|visible)"/g)].map((match) => match[1]);
    assert(visibility[0] === "visible" && visibility.slice(1).every((value) => value === "hidden"), level.id, "missing asset reveals only its own caption");
    for (const challenge of level.exercises.filter((item) => item.format !== "picture-choice")) {
      const html = renderToStaticMarkup(createElement(FinalTestGameplayScreen, { currentChallenge: challenge, wrongAttempts: 0 }));
      assert(html.includes('class="final-test-prompt-th" style="visibility:visible"'), challenge.id, "other formats keep Thai prompt");
    }
  }

  const result = {
    status: findings.length ? "failed" : "ok",
    subject: finalTestSubject.id,
    units: finalTestLevels.length,
    questions: finalTestLevels.reduce((total, level) => total + level.exercises.length, 0),
    formatCounts: expectedFormats,
    registryAssets: finalTestPhotoAssets.length,
    usedRegistryAssets: usedAssets.size,
    randomizedSessions,
    clueRenderCases,
    findings,
  };
  console.log(JSON.stringify(result, null, 2));
  if (findings.length) process.exitCode = 1;
} finally {
  await server.close();
}
