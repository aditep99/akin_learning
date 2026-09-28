"""Create the column-math System Design artifact from the retained template.

The reference document supplies the page geometry, typography, title treatment,
tables, and section styles. This script only swaps the content so the artifact
stays visually consistent with the AkinLearning documentation set.
"""

from copy import deepcopy
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = Path(
    r"C:\Users\Asus\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-system-design\assets\reference.docx"
)
OUTPUT = ROOT / "docs" / "AkinLearning-Column-Math-System-Design.docx"
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
        index: child for index, child in enumerate(original_children) if child.tag == q("p")
    }
    original_tables = {
        index: child for index, child in enumerate(original_children) if child.tag == q("tbl")
    }

    # Keep the template's title page and metadata layout intact.
    children = [deepcopy(original_children[index]) for index in range(23)]
    set_paragraph_text(children[8], "AkinLearning")
    set_paragraph_text(children[9], "Column Math Paper-Style Interaction")
    children[20] = make_table(
        original_tables[20],
        [["STATUS", "IMPLEMENTED", "OWNER", "AkinLearning Product + Engineering", "LAST UPDATED · September 7, 2026"]],
    )
    children[22] = make_table(
        original_tables[22],
        [
            ["Authors", "AkinLearning Product + Engineering"],
            ["Reviewers", "Parent/editor, curriculum, accessibility, and QA reviewers"],
            ["Related docs", "AGENTS.md · DESIGN.md · UX-CONTRACT.md · CONTENT-CONTRACT.md"],
            ["Scope", "Math Genius Column Math and Today Mission paper-style place-value entry"],
        ],
    )

    def heading(index, value):
        return make_paragraph(original_paragraphs[index], value)

    def body_paragraph(index, value):
        return make_paragraph(original_paragraphs[index], value)

    children.extend(
        [
            heading(23, "1. Abstract"),
            body_paragraph(24, "Math Genius Column Math now behaves like a paper worksheet. Learners enter the ones place first, record a carry above the tens when addition requires it, or show the reduced tens and increased ones when subtraction requires borrowing. The same shared gameplay surface powers Math Genius and Today Mission, while Story Math keeps its existing interaction model."),
            heading(27, "2. Goals and Non-Goals"),
            make_table(
                original_tables[28],
                [
                    ["Goals", "Non-goals"],
                    ["Make place-value order visible: ones → regrouping step → tens → hundreds when needed", "Do not change Story Math or other exercise modes"],
                    ["Keep every slot editable through touch, keypad, keyboard, Delete, Clear, and Check", "Do not expose the full answer before the learner completes the steps"],
                    ["Generate bounded, valid, non-duplicate practice with the requested carry/borrow mix", "Do not use unbounded random retry loops for column challenges"],
                    ["Preserve level IDs, progress, saved numbers, and legacy answer 100 compatibility", "Do not change mastery, reward, or retry ownership"],
                ],
            ),
            heading(30, "3. Background and Problem Statement"),
            body_paragraph(31, "The former Column Math flow accepted a single whole-number answer. That hides the place-value decisions children need to practise: carrying from ones to tens and borrowing from tens to ones. It also makes the input order different from a worksheet, where the child works from the rightmost place and records the regrouping mark before moving left."),
            body_paragraph(32, "The change keeps the existing challenge identity and local-first gameplay boundary. A challenge still owns its operands and numeric answer, while deriveColumnSteps computes the visible digits, carry, borrow, and exact input sequence from those values. The UI stores slot strings separately, so an incomplete response remains visibly incomplete."),
            heading(33, "4. Proposed Architecture"),
            body_paragraph(35, "Math Genius generator → deriveColumnSteps(challenge) → MathGeniusGameplayScreen → ColumnEquationBoard + keypad/keyboard → step-aware correctness check → existing correct/wrong/retry flow. TodayMissionChallengeScreen imports the same gameplay screen, so both surfaces receive identical column behavior."),
            body_paragraph(36, "Figure 1. A ruled-paper board has a carry row above the operands, struck-through original digits beside borrow slots, and answer slots aligned to ones/tens/hundreds. The input panel mirrors the sequence without concatenating hidden digits into a misleading whole number."),
            make_paragraph(original_paragraphs[38], "Core components"),
            make_table(
                original_tables[40],
                [
                    ["Component", "Responsibility", "Primary data", "Failure behavior"],
                    ["Column generator", "Builds finite candidate pools per level and excludes duplicate operand pairs", "leftValue, rightValue, operator, regrouping", "Generate a bounded valid session or fail validation"],
                    ["Step derivation", "Calculates answer digits, carries, borrow adjustments, and inputSequence", "deriveColumnSteps(challenge)", "Reject inconsistent challenge metadata"],
                    ["ColumnEquationBoard", "Renders aligned place values, carry/borrow marks, strike-through, and editable slots", "columnSteps + columnInputs", "Keep slots blank and focus the first missing step"],
                    ["Gameplay controller", "Routes touch, keypad, keyboard, Delete, Clear, Check, and retry callbacks", "columnInputs + activeColumnField", "Keep wrong values and focus the first incorrect slot"],
                    ["Mission surface", "Maps Math Genius and Today Mission to the shared renderer and updated copy", "surfaceId, surfaceVariant, rendererKey", "Use the canonical board owner"],
                ],
            ),
            heading(43, "5. Request Lifecycle"),
            body_paragraph(44, "1. Entry — the learner opens a Column Math level or a Today Mission challenge using the existing level ID and progress state."),
            body_paragraph(44, "2. Challenge — the level generator selects from a finite candidate set, applies its operand range and regrouping rule, and records a unique signature."),
            body_paragraph(44, "3. Derivation — the board derives aligned hundreds/tens/ones digits, carry values, borrow adjustments, and the ordered fields to fill."),
            body_paragraph(44, "4. Input — focus starts at the first field. A digit fills one slot, advances to the next field at its maximum length, and remains editable when the learner taps another slot."),
            body_paragraph(44, "5. Check — blank fields show a bilingual prompt and focus the first missing field without counting a wrong attempt. Filled but incorrect fields stay visible, focus the first incorrect field, and use the existing retry callback."),
            body_paragraph(44, "6. Completion — only when every field matches the derived step does the existing onCorrectChoice flow advance the mission."),
            heading(52, "6. API and Data Contracts"),
            make_paragraph(original_paragraphs[53], "Column challenge contract"),
            make_table(
                original_tables[55],
                [
                    ["Field", "Type", "Required", "Description"],
                    ["leftValue / rightValue", "integer", "Yes", "Original two-digit operands; saved challenges retain these values."],
                    ["operator", "+ or -", "Yes", "Column addition or subtraction operation."],
                    ["correctAnswer", "integer", "Yes", "Numeric result from 0–99 for new challenges; 100 remains valid for legacy data."],
                    ["regrouping", "none, carry, or borrow", "Yes", "Must match the arithmetic derived from operands."],
                    ["columnSteps", "object", "Recommended", "answer digits, carry ones/tens, and borrow original/adjusted digits."],
                    ["inputSequence", "string[]", "Recommended", "Exact ordered field IDs, including borrow/carry fields."],
                    ["surface fields", "metadata", "Yes", "surfaceId, surfaceKind, surfaceVariant, rendererKey, and answerRepresentation."],
                ],
            ),
            make_paragraph(original_paragraphs[57], "Level and persistence guarantees"),
            body_paragraph(59, "Level IDs and progress keys remain unchanged; only the generated practice constraints and column interaction are updated."),
            body_paragraph(60, "Saved column challenges keep their original operands and answer. The runtime infers missing step metadata from those values."),
            body_paragraph(61, "A one-digit answer uses a visible tens 0; a zero in the ones place remains an explicit answer slot."),
            body_paragraph(62, "Legacy answer 100 is rendered with a hundreds slot and its hundreds carry as the final leftward step."),
            body_paragraph(63, "Every new challenge is bounded to 0–99 and validated with the same arithmetic and surface contracts as the existing library."),
            body_paragraph(64, "Update DESIGN.md, UX-CONTRACT.md, CONTENT-CONTRACT.md, validators, and this artifact in the same durable changeset."),
            heading(66, "7. Consistency and Correctness"),
            body_paragraph(68, "Addition derives ones and tens sums independently, records a carry of 1 when the ones sum reaches ten, and exposes a second carry only when the tens sum reaches a hundred. Borrowing derives adjusted tens = original tens − 1 and adjusted ones = original ones + 10; the adjusted ones field accepts 10–18. The check compares every filled field with the derived expected value, so a correct final number with an incorrect regrouping step cannot pass."),
            make_table(
                original_tables[69],
                [
                    ["Level", "Practice set", "Validation"],
                    ["1", "5 no-carry two-digit + one-digit, then 5 carry two-digit + one-digit", "Exact 5/5 split; right operand is one digit"],
                    ["2", "Two-digit addition with carry; left operand 15–39", "Carry in every exercise; answer 0–99"],
                    ["3", "Two-digit subtraction with borrow; left operand 21–59", "Borrow in every exercise; left > right"],
                    ["4", "Two-digit addition with carry; left operand 40–59", "Carry in every exercise; answer 0–99"],
                    ["5", "Alternating borrow subtraction and carry addition; left 60–99 / 60–79", "5 borrow + 5 carry; no operand pair reused across levels"],
                ],
            ),
            heading(71, "8. Accessibility and Responsive Design"),
            body_paragraph(73, "Each input slot is a native button with a bilingual accessible name, visible focus ring, active step state, and touch-sized target. Keyboard digits, Backspace/Delete, Enter, and the on-screen keypad share one state model. Status text uses a live region; incomplete checks focus the first missing field and wrong checks focus the first incorrect field without clearing the learner's work."),
            body_paragraph(74, "The Akin Atlas palette, typography, ruled-paper treatment, and existing reduced-motion policy remain in force. Borrowing uses semantic strike-through for the original tens/ones values and a separate adjusted slot so the transformation is visible."),
            body_paragraph(75, "The board switches between two and three digit columns, uses a wider paper surface on desktop, and keeps slots and keypad usable on phone, tablet, and desktop widths. The workspace remains scrollable above the existing mobile navigation."),
            heading(80, "9. Verification Plan"),
            make_table(
                original_tables[81],
                [
                    ["Check", "Expected result", "Owner", "Status"],
                    ["Step examples", "27 + 15 = 42, 52 − 18 = 34, 40 − 17 = 23, one-digit answer, ones digit 0", "QA", "Implemented"],
                    ["Input behavior", "Ones-first focus, carry/borrow slots, edit, Delete, Clear, incomplete Check, repeated Check", "QA", "Implemented"],
                    ["Generator", "256 deterministic seeds × 5 levels; count, mix, ranges, regrouping, arithmetic, and cross-level uniqueness", "Engineering", "Implemented"],
                    ["Project validators", "Mission correctness, surfaces, answers, layout, integrity, contracts, content, and game checks pass", "Engineering", "Run before release"],
                    ["UI audit", "Premium UI audit and design lint report no new findings", "Design + QA", "Run before release"],
                    ["Device QA", "Phone, tablet, desktop, Story Math, and resume behavior remain usable", "QA", "Run before release"],
                ],
            ),
            heading(83, "10. Alternatives Considered"),
            make_table(
                original_tables[86],
                [
                    ["Alternative", "Why it was considered", "Why it was not selected"],
                    ["Keep a single whole-number input", "Smallest code change", "Hides place-value reasoning and cannot practise regrouping steps"],
                    ["Use separate native text inputs", "Direct browser input semantics", "Makes the worksheet less focused and complicates the shared touch keypad flow"],
                    ["Show the answer as a complete number while typing", "Familiar calculator pattern", "Reveals incomplete values as if they were final and breaks ones-first feedback"],
                    ["Generate with repeated random retries", "Easy to write for one constraint", "Can loop indefinitely and does not prove exact level distributions"],
                ],
            ),
            heading(88, "11. Open Questions"),
            body_paragraph(89, "Should future three-digit lessons expose an additional hundreds-to-thousands carry row, or remain within the legacy 100 ceiling?"),
            body_paragraph(90, "Should teachers be able to choose a no-carry warm-up or a regrouping-only set while preserving the fixed ten-question level contract?"),
            body_paragraph(91, "Which curriculum review rubric should certify the wording and progression for each language locale?"),
            body_paragraph(92, "Should session analytics record each step error separately, or only the existing attempt-level event?"),
            heading(94, "12. Decision and Next Steps"),
            body_paragraph(95, "Adopt the shared, step-aware ColumnEquationBoard and deriveColumnSteps contract for Math Genius and Today Mission. Keep Story Math unchanged, preserve level IDs and progress, and use the finite generator plus 256-seed validator as the release gate. Next, complete the responsive browser pass and retain this artifact with the code and contract updates."),
            make_table(
                original_tables[96],
                [
                    ["Milestone", "Deliverable", "Exit criteria", "Owner"],
                    ["M1", "Step-aware board and input state", "Touch, keyboard, Delete, Clear, Check, and focus behavior pass", "Engineering"],
                    ["M2", "Finite level generators", "Ten exercises per level, exact mixes, valid arithmetic, no duplicate pairs", "Curriculum + Engineering"],
                    ["M3", "Contract and surface updates", "DESIGN, UX, CONTENT, and Today Mission share the canonical behavior", "Product"],
                    ["M4", "Release verification", "Build, validators, Premium audit, design lint, and device QA pass", "QA + Engineering"],
                ],
            ),
        ]
    )

    # Preserve the template section properties at the end of the body.
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
