"""Create the Final Test System Design document from the retained template.

The reference document owns the page geometry, typography, tables, headers,
footers, and recurring page elements. This script replaces only the content so
the new design stays consistent with the existing AkinLearning artifacts.
"""

from copy import deepcopy
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = Path(
    r"C:\Users\Asus\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-system-design\assets\reference.docx"
)
OUTPUT = ROOT / "docs" / "AkinLearning-Final-Test-System-Design.docx"
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
    paragraph = (
        deepcopy(template_paragraph)
        if template_paragraph is not None
        else ET.Element(q("p"))
    )
    set_paragraph_text(paragraph, value)
    cell.append(paragraph)


def make_table(template, rows):
    table = deepcopy(template)
    source_rows = table.findall(q("tr"))
    if not source_rows:
        return table
    row_template = source_rows[1] if len(source_rows) > 1 else source_rows[0]
    cell_count = len(source_rows[0].findall(q("tc")))
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
        index: child
        for index, child in enumerate(original_children)
        if child.tag == q("p")
    }
    original_tables = {
        index: child
        for index, child in enumerate(original_children)
        if child.tag == q("tbl")
    }

    children = [deepcopy(original_children[index]) for index in range(23)]
    set_paragraph_text(children[8], "AkinLearning")
    set_paragraph_text(children[9], "Final Test · Cambridge World English 1")
    children[20] = make_table(
        original_tables[20],
        [[
            "STATUS",
            "IMPLEMENTED",
            "OWNER",
            "AkinLearning Product + Engineering",
            "LAST UPDATED · September 8, 2026",
        ]],
    )
    children[22] = make_table(
        original_tables[22],
        [
            ["Authors", "AkinLearning Product + Engineering"],
            ["Reviewers", "EP teacher, curriculum, accessibility, and QA reviewers"],
            ["Related docs", "AGENTS.md · CONTENT-CONTRACT.md · UX-CONTRACT.md · DESIGN.md"],
            ["Scope", "Final Test world, Units 1–4, 160 questions, local photo registry, and Today Mission reuse"],
        ],
    )

    def heading(index, value):
        return make_paragraph(original_paragraphs[index], value)

    def body_paragraph(index, value):
        return make_paragraph(original_paragraphs[index], value)

    children.extend(
        [
            heading(23, "1. Abstract"),
            body_paragraph(24, "Final Test is a separate AkinLearning world for Cambridge World English 1 review at Primary 1 EP level. It contains four Unit maps with exactly 40 questions each—160 questions total—covering Units 1–4 from the supplied pointers: school and colours, family and possession, toys and places, and transport and shapes. Six child-friendly formats share one gameplay route: picture choice, matching, fill blank, sentence order, short reading, and applied situations."),
            heading(27, "2. Goals and Non-Goals"),
            make_table(
                original_tables[28],
                [
                    ["Goals", "Non-goals"],
                    ["Give children a clear, separate Final Test world with four Unit maps and 40 balanced questions per Unit", "Do not change English Exercises, Science, Math, Story Math, spelling modes, or their existing IDs and progress"],
                    ["Use English-first prompts with Thai helpers, real local photos where a picture is part of the task, and visible keyboard/touch focus", "Do not claim to reproduce the complete Cambridge book word list or require a network image service"],
                    ["Persist latest and best first-attempt scores while allowing retry without pass/fail blocking", "Do not turn a Today Mission review into automatic Unit completion"],
                    ["Keep question IDs, answer keys, option order semantics, session resume, and deterministic review behavior stable", "Do not store a random answer key or executable code in content payloads"],
                ],
            ),
            heading(30, "3. Background and Problem Statement"),
            body_paragraph(31, "The existing English Exercises world is organized as short vocabulary missions. A school request now needs a longer end-of-term practice route for Primary 1 EP learners, based on the visible Unit 1–4 topics in the supplied pointer. Children need more than one interaction pattern: they must recognize real objects, pair words and meanings, complete simple grammar, order short sentences, read a small passage, and apply a choice to a familiar situation."),
            body_paragraph(32, "The Final Test boundary is additive. A permanent subject ID and four permanent level IDs keep progress independent from English Exercises. Content remains bundled for offline play. The shell, mastery/reward engine, Today Mission planner, and existing navigation continue to own their current responsibilities; only the Final Test renderer owns the six assessment boards."),
            heading(33, "4. Proposed Architecture"),
            body_paragraph(35, "Pointer topics → reviewed Primary 1 EP roster → finalTestExercises.js → contentLibrary/defaultLibrary → Final Test world card and four Unit map → deterministic session → FinalTestGameplayScreen → one onFinalTestAnswer callback → learningState.finalTestResults. Local photo files flow through finalTestPhotoAssets.js and are used by VocabularyVisual-style photo cards with a readable fallback."),
            body_paragraph(36, "Figure 1. Final Test is a versioned local content boundary. A level contains authored question semantics and stable IDs; session creation may shuffle safe presentation arrays without changing answer IDs. Today Mission selects the same canonical challenge and renderer with presentation=\"today\", so it receives the same photos and interaction without completing a Unit."),
            make_paragraph(original_paragraphs[38], "Core components"),
            make_table(
                original_tables[40],
                [
                    ["Component", "Responsibility", "Primary data", "Failure behavior"],
                    ["Final Test subject", "Owns the permanent subject ID, four Unit configs, roster, format counts, and stable authored question IDs", "finalTestExercises.js", "Bundled content remains playable; validator rejects a missing Unit or malformed question"],
                    ["Photo registry", "Maps a photoAssetId to a local 4:3 raster, dimensions, SHA-256, license, creator, provenance, and review date", "finalTestPhotoAssets.js + src/assets/final-test/photo", "A broken image falls back to a camera/word label; asset validation reports the defect"],
                    ["FinalTestGameplayScreen", "Routes six boards through one focus shell and one submit callback while keeping incomplete answers out of attempt counts", "currentChallenge + presentation", "Wrong values stay visible and focus returns to the first repair point"],
                    ["Progress adapter", "Stores first-attempt score, best score, attempts, total questions, and completion time per Unit", "learningState.finalTestResults[levelId]", "Retry starts a fresh session and keeps saved statistics"],
                    ["Today Mission bridge", "Reuses the canonical challenge and renderer with Today Mission callbacks and summary behavior", "TodayMissionChallengeScreen", "Today completion owns mission progress; Final Test Unit progress is unchanged"],
                ],
            ),
            heading(43, "5. Request Lifecycle"),
            body_paragraph(44, "1. Entry — the child selects the Final Test world card and sees a four-Unit map with independent progress."),
            body_paragraph(44, "2. Unit start — handleStartLevel creates a deterministic session from the authored 40-question Unit and resets only the current Final Test session counters."),
            body_paragraph(44, "3. Presentation — picture choices initially show only the English prompt and local photos. At wrongAttempts >= 3, reveal the Thai prompt and every English/Thai option caption. Clear retains unlocked clues; a new question or Retry resets them. A broken photo reveals only its own text fallback immediately. Reserve caption space and use shared ActionButton for Check/Clear; matching, fill blank, sentence order, reading, and applied boards show the prompt plus a Thai helper without revealing the answer."),
            body_paragraph(44, "4. Answer — each board reports one complete submission through onFinalTestAnswer({ challengeId, levelId, correct, answer, firstAttempt, presentation }). Incomplete checks show help and do not increment attempts."),
            body_paragraph(44, "5. Retry — a wrong complete answer remains on screen, increments the current question's retry state, and focuses the first repair point. A correct answer advances only after the shared success transition."),
            body_paragraph(44, "6. Unit completion — the app records latestFirstAttemptScore, bestFirstAttemptScore, totalQuestions=40, attempts, and completedAt, then shows the Final Test summary with Retry Unit and Back to Map."),
            body_paragraph(44, "7. Resume — active Today Mission migration keeps the saved challenge ID, option order, answer key, index, and progress while refreshing only current local photo URLs from the registry."),
            heading(52, "6. API and Data Contracts"),
            make_paragraph(original_paragraphs[53], "Question contract"),
            make_table(
                original_tables[55],
                [
                    ["Field", "Type", "Required", "Description"],
                    ["id / unitId", "stable text", "Yes", "final-test-u{unit}-q{01..40} and unit-{1..4}; IDs survive sessions and resume."],
                    ["type / format / mode", "text", "Yes", "type=final-test and one of picture-choice, matching, fill-blank, sentence-order, reading, applied; mode is final-{format}."],
                    ["prompt", "{ en, th }", "Yes", "English child-facing prompt and Thai helper; neither is an answer key."],
                    ["choices / correctChoiceId", "array + text", "Choice formats", "Exactly one visible correct choice for picture, reading, and applied questions."],
                    ["pairs / answerMap", "array + object", "Matching", "Every left ID maps to one right ID; pair order can be shuffled safely."],
                    ["acceptedAnswers", "string[]", "Fill blank", "Lowercase normalized answers accepted by the board."],
                    ["tokens / correctTokenIds", "array", "Sentence order", "Stable token IDs reconstruct the authored sentence; display order may be shuffled."],
                    ["photoAssetId", "stable text", "When pictured", "Resolves only to a local registry asset; no SVG/data URI is authored in Final Test."],
                ],
            ),
            make_paragraph(original_paragraphs[57], "Progress and fallback guarantees"),
            body_paragraph(59, "Each Unit has exactly 40 questions: 8 picture choice, 6 matching, 8 fill blank, 6 sentence order, 6 reading, and 6 applied."),
            body_paragraph(60, "A complete answer is the only event that increments attempts. Blank or incomplete checks show guidance and do not count as wrong."),
            body_paragraph(61, "A wrong complete answer keeps the learner's value and focuses the first repair point; a correct answer advances to the next question."),
            body_paragraph(62, "Every image question resolves to a local, provenance-backed photo with 4:3 dimensions, at least 1024×768, under 5 MB, and a matching SHA-256."),
            body_paragraph(63, "The shared image → emoji/camera → word fallback preserves a readable choice when a file fails to load; it never changes correctness."),
            body_paragraph(64, "A Today Mission review uses the same board and answer contract with presentation=\"today\" and does not mark a Final Test Unit complete."),
            heading(66, "7. Content Coverage and Correctness"),
            body_paragraph(68, "Unit 1 covers classroom objects, colours, numbers, singular/plural forms, and basic adjectives. Unit 2 covers family, have got/haven't got, and possessive adjectives. Unit 3 covers toys, prepositions, There is/There are, number/size/colour adjectives, and ck/sh. Unit 4 covers transport, by/on, shapes, transport jobs, and ch/th. The roster is a reviewed practice set aligned to the supplied pointers; it is not presented as a complete transcription of Cambridge World English 1."),
            make_table(
                original_tables[69],
                [
                    ["Unit", "Formats", "Representative skills", "Gate"],
                    ["Unit 1", "8 / 6 / 8 / 6 / 6 / 6", "At School, colours, numbers, plural -s/-es, adjectives", "40 stable questions and exact format counts"],
                    ["Unit 2", "8 / 6 / 8 / 6 / 6 / 6", "Family, have got/haven't got, my/your/his/her/our/their", "Answer IDs and accepted grammar forms agree"],
                    ["Unit 3", "8 / 6 / 8 / 6 / 6 / 6", "Toys, place words, There is/are, size/colour, ck/sh", "Photo choices are distinct within a question"],
                    ["Unit 4", "8 / 6 / 8 / 6 / 6 / 6", "Transport, by/on, shapes, jobs, ch/th", "Transport and shape choices remain unambiguous"],
                    ["All Units", "160 total", "Stable IDs, prompts, answer maps, photos, deterministic sessions", "validate:final-test runs 256 seeds per Unit"],
                ],
            ),
            heading(71, "8. Accessibility and Responsive Design"),
            body_paragraph(73, "The Final Test board uses native buttons and inputs with visible focus rings, keyboard activation, touch-sized targets, and English labels plus Thai helpers. Matching and sentence-order controls expose their state through text, check marks, and aria-pressed; colour and photography are never the only signal."),
            body_paragraph(74, "The local photo frame reserves a stable 4:3 window and uses object-fit: cover for a clear single subject. At phone, tablet, desktop, and 200% zoom the board keeps natural scrolling and leaves Check/Clear reachable. Reduced motion removes lift transitions while preserving focus, feedback, and the same answer sequence."),
            body_paragraph(75, "When an image fails, the fallback preserves a readable camera marker and the visible word. When a response is incomplete, the board explains what remains without marking it wrong. When a response is wrong, the entered value stays available for editing and the first correction target receives focus."),
            heading(80, "9. Verification Plan"),
            make_table(
                original_tables[81],
                [
                    ["Check", "Expected result", "Owner", "Status"],
                    ["Final Test validator", "Four Units, 40 questions each, exact format distribution, valid answers, local photo gates, and 256 seeds per Unit", "Engineering", "Implemented"],
                    ["Contracts and content", "Final Test subject, surfaces, payload, migration, answer, and fallback contracts remain valid", "Engineering", "Run before release"],
                    ["Gameplay interaction", "Keyboard/touch, incomplete answer, edit, Clear, wrong retry, correct advance, and summary retry work", "QA", "Run before release"],
                    ["Progress and Today Mission", "First-attempt/best scores persist; Today review does not auto-complete a Unit", "QA", "Run before release"],
                    ["Image and responsive audit", "Every pictured choice is clear on phone, tablet, and desktop; failed image fallback stays usable", "Design + QA", "Run before release"],
                    ["Artifact render", "This DOCX keeps the retained template page geometry and renders without XML/package errors", "Product", "Run before release"],
                ],
            ),
            heading(83, "10. Alternatives Considered"),
            make_table(
                original_tables[86],
                [
                    ["Alternative", "Why it was considered", "Why it was not selected"],
                    ["Add final questions to English Exercises", "Would reuse an existing world and route", "Mixes practice and assessment progress and makes the requested Final Test map unclear"],
                    ["Use one generic choice renderer", "Lowest implementation cost", "Cannot express matching, token order, text entry, and reading without hiding the interaction contract"],
                    ["Use vector illustrations or remote stock photos", "Fast visual coverage", "Conflicts with the real-photo/offline/provenance requirements and may make options visually ambiguous"],
                    ["Block retry after a low score", "Feels like a formal exam", "Creates frustration for a young learner; the requested design keeps first-attempt reporting while allowing practice"],
                ],
            ),
            heading(88, "11. Open Questions"),
            body_paragraph(89, "Which named EP teacher or curriculum reviewer should approve the final Thai wording, reading load, and cultural fit before any formal curriculum alignment claim?"),
            body_paragraph(90, "Should future Units add additional reviewed photos per concept while keeping per-question asset uniqueness and offline bundle size within the current gate?"),
            body_paragraph(91, "Should analytics separate a child-initiated retry from an image fallback event while preserving the same score contract?"),
            body_paragraph(92, "Which release workflow should publish a reviewed Final Test revision to Supabase after the local validator and device audit pass?"),
            heading(94, "12. Decision and Next Steps"),
            body_paragraph(95, "Adopt Final Test as a separate subject with four permanent Unit IDs, a local reviewed photo registry, six shared board types, and one submission callback. Ship the bundled 160-question set with validator coverage, contract updates, deterministic 256-seed checks, and browser QA across phone, tablet, and desktop. Keep the roster described as a reviewed practice set aligned to the supplied Unit pointers until a named curriculum reviewer provides any further approval."),
            make_table(
                original_tables[96],
                [
                    ["Milestone", "Deliverable", "Exit criteria", "Owner"],
                    ["M1", "Final Test roster, four Unit maps, and local photo registry", "160 stable questions, six exact format counts per Unit, complete provenance/hash fields", "Content + Engineering"],
                    ["M2", "Gameplay and summary flow", "All six boards support touch/keyboard, retry, Clear, focus, and first-attempt score", "Engineering"],
                    ["M3", "Today Mission and resume bridge", "Shared challenge/renderer works in Today mode; saved state preserves IDs and progress", "QA + Engineering"],
                    ["M4", "Release audit and artifact", "Validators, import dry-run, build, Premium audit, document structure/render, and device QA pass", "Product + QA"],
                ],
            ),
        ]
    )

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
