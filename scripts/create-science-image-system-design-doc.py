"""Create the Science image asset System Design artifact from the retained template.

The System Design reference owns the page geometry, typography, section styles,
tables, and title treatment. This script only replaces the content so the
artifact remains visually consistent with the other AkinLearning designs.
"""

from copy import deepcopy
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = Path(
    r"C:\Users\Asus\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-system-design\assets\reference.docx"
)
OUTPUT = ROOT / "docs" / "AkinLearning-Science-Image-Asset-System-Design.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
ET.register_namespace("w", W_NS)
ET.register_namespace("xml", XML_NS)


def q(local: str) -> str:
    return f"{{{W_NS}}}{local}"


def set_paragraph_text(paragraph, value: str):
    ppr = paragraph.find(q("pPr"))
    first_run = paragraph.find(q("r"))
    run_properties = (
        deepcopy(first_run.find(q("rPr")))
        if first_run is not None and first_run.find(q("rPr")) is not None
        else None
    )
    for child in list(paragraph):
        if child is not ppr:
            paragraph.remove(child)
    run = ET.SubElement(paragraph, q("r"))
    if run_properties is not None:
        run.append(run_properties)
    node = ET.SubElement(run, q("t"))
    if value[:1].isspace() or value[-1:].isspace():
        node.set(f"{{{XML_NS}}}space", "preserve")
    node.text = value
    return paragraph


def make_paragraph(template, value: str):
    return set_paragraph_text(deepcopy(template), value)


def set_cell_text(cell, value: str):
    tcpr = cell.find(q("tcPr"))
    template_paragraph = cell.find(q("p"))
    for child in list(cell):
        if child is not tcpr:
            cell.remove(child)
    paragraph = deepcopy(template_paragraph) if template_paragraph is not None else ET.Element(q("p"))
    set_paragraph_text(paragraph, value)
    cell.append(paragraph)


def make_table(template, rows):
    table = deepcopy(template)
    source_rows = table.findall(q("tr"))
    if not source_rows:
        return table
    row_template = source_rows[1] if len(source_rows) > 1 else source_rows[0]
    for row in table.findall(q("tr")):
        table.remove(row)
    for row_index, values in enumerate(rows):
        row_node = deepcopy(source_rows[0] if row_index == 0 else row_template)
        cells = row_node.findall(q("tc"))
        for index, cell in enumerate(cells):
            set_cell_text(cell, str(values[index]) if index < len(values) else "")
        table.append(row_node)
    return table


with zipfile.ZipFile(REFERENCE, "r") as source_zip:
    document = ET.fromstring(source_zip.read("word/document.xml"))
    body = document.find(q("body"))
    original_children = list(body)
    original_paragraphs = {
        index: child for index, child in enumerate(original_children) if child.tag == q("p")
    }
    original_tables = {
        index: child for index, child in enumerate(original_children) if child.tag == q("tbl")
    }

    # Keep the reference title page and metadata table geometry intact.
    children = [deepcopy(original_children[index]) for index in range(23)]
    set_paragraph_text(children[8], "AkinLearning")
    set_paragraph_text(children[9], "Science Image Asset and Visual Choice System")
    children[20] = make_table(
        original_tables[20],
        [["STATUS", "IMPLEMENTED", "OWNER", "AkinLearning Product + Engineering", "LAST UPDATED · September 7, 2026"]],
    )
    children[22] = make_table(
        original_tables[22],
        [
            ["Authors", "AkinLearning Product + Engineering"],
            ["Reviewers", "Parent/editor, curriculum, accessibility, and QA reviewers"],
            ["Related docs", "AGENTS.md · CONTENT-CONTRACT.md · UX-CONTRACT.md · DESIGN.md"],
            ["Scope", "Science Exercises Levels 1–6, Today Mission reuse, local photo registry, and offline resume"],
        ],
    )

    def heading(index, value):
        return make_paragraph(original_paragraphs[index], value)

    def body_paragraph(index, value):
        return make_paragraph(original_paragraphs[index], value)

    children.extend(
        [
            heading(23, "1. Abstract"),
            body_paragraph(24, "Science Exercises now uses a reviewed local photo registry for visual answer choices. Plant Parts shows five distinct close-ups—roots in soil, a stem with nodes, one veined leaf, one flower, and one fruit—and Science animal choices use clear Dolphin, Whale, Fish, and Duck photos instead of ambiguous SVG or emoji fallbacks. The shared VocabularyVisual hierarchy, challenge IDs, answer semantics, randomization, scoring, progress, and Today Mission surface remain unchanged."),
            heading(27, "2. Goals and Non-Goals"),
            make_table(
                original_tables[28],
                [
                    ["Goals", "Non-goals"],
                    ["Give every visible Science choice one clear, offline-capable photo with one dominant subject and no answer-revealing marks", "Do not change prompts, challenge IDs, answer IDs, scoring, retry behavior, or level progress"],
                    ["Keep provenance, license, creator, source URL, dimensions, transform, review date, and SHA-256 beside each asset", "Do not fetch remote images at runtime or make network availability part of the child loop"],
                    ["Enforce 4:3, readable, bounded files and no duplicate visual identity inside one challenge", "Do not prohibit a deliberate review photo from appearing in a later challenge"],
                    ["Rehydrate stale saved Science visuals while preserving the learner's saved challenge order and state", "Do not create a new Today Mission interaction or duplicate renderer"],
                ],
            ),
            heading(30, "3. Background and Problem Statement"),
            body_paragraph(31, "Parts of a Plant previously rendered the same whole-plant SVG for every option and changed only a small highlight. At the displayed size, Root, Stem, Leaf, Flower, and Fruit therefore looked nearly identical. Some Science animals also lacked a reviewed photo and fell through to emoji, while older crops could include a clipped neighboring object. These states make a young learner spend effort decoding the artwork instead of the science concept."),
            body_paragraph(32, "The product boundary is visual content only. The canonical Science level definitions still own the same prompts, exercise modes, word IDs, order, and answer policy. A registry marker travels with the word object so validators and resume migration can distinguish a reviewed local asset from a generic image. The image itself never carries the answer label, arrow, highlight, or other cue."),
            heading(33, "4. Proposed Architecture"),
            body_paragraph(35, "Wikimedia Commons source → reviewed crop/resize → local JPEG under src/assets/science/photo → sciencePhotoAssets registry → Science word override → canonical VocabularyVisual → choice card or sorting item. The same canonical challenge object is used by GameplayScreen and TodayMissionChallengeScreen; a saved Science activity passes through migrateActiveMission before it renders."),
            body_paragraph(36, "Figure 1. Local assets are a deterministic offline boundary. The registry verifies file identity and provenance; the shared renderer provides the existing image → emoji → word fallback when a local image cannot load. The resume path changes only image fields and keeps challenge semantics intact."),
            make_paragraph(original_paragraphs[38], "Core components"),
            make_table(
                original_tables[40],
                [
                    ["Component", "Responsibility", "Primary data", "Failure behavior"],
                    ["Science photo registry", "Maps wordId to a local imported asset and records provenance, license, dimensions, transform, review date, and hash", "sciencePhotoAssets.js", "Validator rejects missing, unreadable, oversized, unlicensed, or mismatched files"],
                    ["Science subject wiring", "Overrides reviewed animal and Plant Parts visuals while preserving vocabulary IDs and metadata", "scienceExercises.js + createVisualWord", "A missing image still has shared emoji/word fallback; validator flags the authored choice"],
                    ["VocabularyVisual", "Renders the shared image → emoji → word hierarchy with accessible labels", "word.image, word.emoji, word.word", "onError hides the broken image and exposes the next readable representation"],
                    ["Science card variant", "Provides a localized 4:3 contain frame for choices and sorting items", "choice-card--science-photo", "Only Science gets the photo frame; other subjects keep their existing card styles"],
                    ["Resume rehydration", "Refreshes stale saved Science visual fields from the current library", "refreshScienceChallengeVisuals", "Preserves IDs, option order, baskets, prompts, answers, index, attempts, and progress"],
                ],
            ),
            heading(43, "5. Request Lifecycle"),
            body_paragraph(44, "1. Source review — select a CC0 1.0 or public-domain source with verifiable Commons provenance and one clear subject."),
            body_paragraph(44, "2. Local preparation — crop or resize to a 4:3 JPEG at 1024×768 or larger, keep the dominant object readable, calculate SHA-256, and record the transform."),
            body_paragraph(44, "3. Registry — import the local module and add assetId, wordId, source metadata, license, creator, source URLs, dimensions, hash, and reviewedAt."),
            body_paragraph(44, "4. Subject wiring — attach the registry image and sciencePhotoAssetId to the canonical Science word. The challenge keeps its existing answer ID and visible ordering."),
            body_paragraph(44, "5. Render — GameplayScreen adds the named Science photo class to picture cards and sorting items. Today Mission uses the same wrapper and canonical surface."),
            body_paragraph(44, "6. Resume — migrateActiveMission resolves the current Science word index and replaces only stale image/registry fields in choices, items, groupWords, oddWord, reviewWord, and targetWord."),
            body_paragraph(44, "7. Verify — validate:science-images checks every visible row, per-challenge identity uniqueness, file readability, dimensions, size, hash, wiring, provenance, and registry usage."),
            heading(52, "6. API and Data Contracts"),
            make_paragraph(original_paragraphs[53], "Science photo asset contract"),
            make_table(
                original_tables[55],
                [
                    ["Field", "Type", "Required", "Description"],
                    ["assetId", "stable text", "Yes", "Namespaced identity used for duplicate checks and audit."],
                    ["wordId + src", "text + local module URL", "Yes", "Canonical vocabulary identity and offline runtime source."],
                    ["width / height", "integer", "Yes", "Final file dimensions; current reviewed pack is 1024×768 (4:3)."],
                    ["sha256", "hex text", "Yes", "Hash of the exact local file, used to detect silent replacement."],
                    ["license / creator", "text", "Yes", "CC0 1.0 or Public domain plus source creator."],
                    ["sourceUrl / sourceAssetUrl", "HTTPS text", "Yes", "Human-readable provenance page and original media URL."],
                    ["transform / reviewedAt", "text + ISO date", "Yes", "Crop/resize audit trail and last visual/provenance review."],
                    ["sciencePhotoAssetId", "text", "Choice wiring", "Word-level link used by resume refresh and card audit."],
                ],
            ),
            make_paragraph(original_paragraphs[57], "Content and fallback guarantees"),
            body_paragraph(59, "Every visible choice or sorting item in Science Exercises Levels 1–6 has a local image source after the subject override is resolved."),
            body_paragraph(60, "Within one challenge, asset ID, local path, and hash are unique. Reuse across later challenges remains valid review content."),
            body_paragraph(61, "A failed image load follows the existing image → emoji → word fallback without changing answer IDs, retry state, or scoring."),
            body_paragraph(62, "Saved Science missions rehydrate current visuals in place; challenge ID, option order, prompt, answer, basket, mission index, and progress remain stable."),
            body_paragraph(63, "The local pack is offline-first and does not require a new content surface, interaction mode, or remote service."),
            body_paragraph(64, "Update CONTENT-CONTRACT.md, UX-CONTRACT.md, DESIGN.md, the validator, manifest/backup artifacts, and this document together."),
            heading(66, "7. Consistency and Correctness"),
            body_paragraph(68, "Plant Parts uses five separate reviewed photos with distinct asset IDs and paths. Dolphin and Whale no longer depend on emoji fallback; Fish and Duck use the reviewed Science overrides so existing cross-level choices also remain photo-backed. The validator walks every authored challenge, counts all visible choices/items, checks duplicate fingerprints only within that challenge, and confirms every registry asset is actually used."),
            make_table(
                original_tables[69],
                [
                    ["Rule", "Expected behavior", "Validation"],
                    ["Plant Parts", "Root, Stem, Leaf, Flower, and Fruit each have a distinct close-up photo", "Level 5 choices use five unique registry IDs, paths, and hashes"],
                    ["Animal additions", "Dolphin, Whale, Fish, and Duck use reviewed local photos", "Registry IDs are wired to the canonical Science word index and visible rows"],
                    ["Per-challenge uniqueness", "No duplicate asset ID, path, or hash among choices/items shown together", "validate:science-images reports a finding and exits non-zero"],
                    ["File gate", "Readable PNG/JPEG, at least 1024×768, no larger than 5 MB, exact hash", "Byte-level parser and SHA-256 check"],
                    ["Resume", "Only stale visual fields change when active Science missions are restored", "Migration fixture preserves semantic fields and order"],
                ],
            ),
            heading(71, "8. Accessibility and Responsive Design"),
            body_paragraph(73, "Photo cards retain the shared native button, keyboard focus ring, touch target, visible English value, Thai meaning/IPA metadata, and accessible option name. The photo frame uses contain rather than a crop that can hide the subject. No color highlight, overlay, label, arrow, or image treatment is the only source of meaning."),
            body_paragraph(74, "On phone, tablet, and desktop widths the named Science variant keeps a stable 4:3 frame and lets the existing board own natural scrolling. Sorting items use the same local photo treatment. Reduced motion removes lift/scale transitions while preserving focus, error, and fallback states."),
            body_paragraph(75, "If a photo cannot load, the shared fallback exposes the emoji and then the word, so the child still has a readable, actionable choice. This path works for keyboard, touch, and screen-reader users without changing mission correctness."),
            heading(80, "9. Verification Plan"),
            make_table(
                original_tables[81],
                [
                    ["Check", "Expected result", "Owner", "Status"],
                    ["Asset validator", "All Science levels/challenges have readable, bounded, provenance-backed, non-duplicate images", "Engineering", "Implemented"],
                    ["Content and mission contracts", "IDs, prompts, modes, surface inheritance, answers, scoring, and progress remain valid", "Engineering", "Run before release"],
                    ["Resume fixture", "Saved stale Science images refresh while order and semantic fields remain unchanged", "QA", "Run before release"],
                    ["Responsive browser QA", "Level 5 cards are clear on phone, tablet, and desktop; focus and fallback remain usable", "Design + QA", "Run before release"],
                    ["Today Mission", "A shared Science challenge receives the same photo and interaction automatically", "QA", "Run before release"],
                    ["Artifact render", "The System Design document keeps the retained template layout and renders without corruption", "Product", "Run before release"],
                ],
            ),
            heading(83, "10. Alternatives Considered"),
            make_table(
                original_tables[86],
                [
                    ["Alternative", "Why it was considered", "Why it was not selected"],
                    ["Keep one highlighted plant SVG", "Already bundled and lightweight", "All options retain the same silhouette, making the semantic distinction too subtle"],
                    ["Use emoji for missing animals", "No asset work required", "Emoji style varies by platform and is less precise for Dolphin and Whale"],
                    ["Fetch stock/remote photos at runtime", "Could provide many images", "Breaks offline play, provenance review, and deterministic rendering"],
                    ["Reject any photo reused later", "Would maximize novelty", "Review repetition across separate challenges is pedagogically valid; only same-challenge ambiguity is prohibited"],
                ],
            ),
            heading(88, "11. Open Questions"),
            body_paragraph(89, "Which named curriculum reviewer should sign off the Thai/English plant-part wording and photo interpretation before formal curriculum claims?"),
            body_paragraph(90, "Should a future content release add a second reviewed photo for each word to support larger randomized pools while retaining per-challenge uniqueness?"),
            body_paragraph(91, "Should analytics distinguish a photo load failure from an emoji fallback while keeping answer and retry semantics identical?"),
            body_paragraph(92, "Which regional retention and takedown process should govern future third-party public-domain or CC0 source reviews?"),
            heading(94, "12. Decision and Next Steps"),
            body_paragraph(95, "Adopt the local, provenance-backed Science photo registry and the named Science photo-card variant. Keep the existing content and mission boundaries, run the image validator with the contract/build suite, complete browser checks for Level 5 and Today Mission, and add newly reviewed assets through the same registry and hash gate."),
            make_table(
                original_tables[96],
                [
                    ["Milestone", "Deliverable", "Exit criteria", "Owner"],
                    ["M1", "Reviewed local photo pack and registry", "Nine assets load offline and all provenance/hash fields are complete", "Content + Engineering"],
                    ["M2", "Science subject and card wiring", "Levels 1–6 and sorting items use clear photos with shared fallback", "Engineering"],
                    ["M3", "Resume and validation boundary", "Saved visual refresh preserves challenge semantics; validator is green", "QA + Engineering"],
                    ["M4", "Release artifact and device pass", "Contracts, import dry-run, build, Premium audit, render, and device QA pass", "Product + QA"],
                ],
            ),
        ]
    )

    # Preserve the reference section properties at the end of the document.
    children.append(deepcopy(original_children[-1]))
    for child in list(body):
        body.remove(child)
    for child in children:
        body.append(child)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as target_zip:
        for item in source_zip.infolist():
            data = source_zip.read(item.filename)
            if item.filename == "word/document.xml":
                data = ET.tostring(document, encoding="utf-8", xml_declaration=True)
            target_zip.writestr(item, data)

print(OUTPUT)
