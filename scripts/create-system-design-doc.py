"""Clone the retained System Design reference and fill its existing styles.

This intentionally edits the Word XML instead of generating a generic new
document, so the reference page setup, recurring styles, table borders, and
title-page treatment remain the visual source of truth.
"""

from copy import deepcopy
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = Path(
    r"C:\Users\Asus\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-system-design\assets\reference.docx"
)
OUTPUT = ROOT / "docs" / "AkinLearning-Supabase-System-Design.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
ET.register_namespace("w", W_NS)
ET.register_namespace("xml", XML_NS)


def q(local: str) -> str:
    return f"{{{W_NS}}}{local}"


def text_nodes(element):
    return element.findall(f".//{q('t')}")


def set_paragraph_text(paragraph, text: str):
    ppr = paragraph.find(q("pPr"))
    first_run = paragraph.find(q("r"))
    run_properties = deepcopy(first_run.find(q("rPr"))) if first_run is not None and first_run.find(q("rPr")) is not None else None
    for child in list(paragraph):
        if child is not ppr:
            paragraph.remove(child)
    run = ET.SubElement(paragraph, q("r"))
    if run_properties is not None:
        run.append(run_properties)
    node = ET.SubElement(run, q("t"))
    if text[:1].isspace() or text[-1:].isspace():
        node.set(f"{{{XML_NS}}}space", "preserve")
    node.text = text
    return paragraph


def make_paragraph(template, text: str):
    return set_paragraph_text(deepcopy(template), text)


def set_cell_text(cell, text: str):
    tcpr = cell.find(q("tcPr"))
    template_paragraph = cell.find(q("p"))
    for child in list(cell):
        if child is not tcpr:
            cell.remove(child)
    paragraph = deepcopy(template_paragraph) if template_paragraph is not None else ET.Element(q("p"))
    set_paragraph_text(paragraph, text)
    cell.append(paragraph)


def make_table(template, rows):
    table = deepcopy(template)
    table_rows = table.findall(q("tr"))
    if not table_rows:
        return table
    row_template = table_rows[1] if len(table_rows) > 1 else table_rows[0]
    cell_count = len(table_rows[0].findall(q("tc")))
    normalized_rows = [list(row[:cell_count]) + [""] * max(0, cell_count - len(row)) for row in rows]
    existing_rows = table.findall(q("tr"))
    for row in existing_rows:
        table.remove(row)
    for row_index, values in enumerate(normalized_rows):
        row_node = deepcopy(table_rows[0] if row_index == 0 else row_template)
        cells = row_node.findall(q("tc"))
        for index, cell in enumerate(cells):
            set_cell_text(cell, str(values[index]) if index < len(values) else "")
        table.append(row_node)
    return table


def replace_table_text(table, values):
    rows = table.findall(q("tr"))
    if not rows:
        return table
    cells = rows[0].findall(q("tc"))
    for index, cell in enumerate(cells):
        set_cell_text(cell, values[index] if index < len(values) else "")
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

    children = []
    # Retain the reference title-page spacing and metadata tables.
    for index in range(23):
        children.append(deepcopy(original_children[index]))
    set_paragraph_text(children[8], "AkinLearning")
    set_paragraph_text(children[9], "Supabase Content and Learner Data Platform")
    children[20] = make_table(
        original_tables[20],
        [["STATUS", "PROPOSED", "OWNER", "AkinLearning Product + Engineering", "LAST UPDATED · August 23, 2026"]],
    )
    children[22] = make_table(
        original_tables[22],
        [
            ["Authors", "AkinLearning Product + Engineering"],
            ["Reviewers", "Parent/editor, security, data, and curriculum reviewers"],
            ["Related docs", "AGENTS.md · CONTENT-CONTRACT.md · UX-CONTRACT.md · SUPABASE_SETUP.md"],
            ["Scope", "Versioned Supabase content, published fallback, authoring, and optional parent-linked learner sync"],
        ],
    )

    def heading(index, value):
        return make_paragraph(original_paragraphs[index], value)

    def body_paragraph(index, value):
        return make_paragraph(original_paragraphs[index], value)

    children.extend([
        heading(23, "1. Abstract"),
        body_paragraph(24, "AkinLearning adds a versioned Supabase content platform around the existing React/Vite learning runtime. Published curriculum and grade-band releases become the scalable source for Worlds and mission maps, while bundled code remains the complete offline fallback. Renderer, generator, mastery, reward, and retry logic stay code-owned. Optional parent-linked progress adds append-only attempts, idempotent sync, server projections, and session conflict detection without requiring a child login."),
        heading(27, "2. Goals and Non-Goals"),
        make_table(original_tables[28], [
            ["Goals", "Non-goals"],
            ["Publish curriculum, grade, level metadata, payload revisions, checksums, and rollback pointers", "Do not replace React renderers, learning generators, mastery, or reward formulas with database code"],
            ["Support bulk JSON import and Parent Library scope selection with validation before publish", "Do not expose draft/review content or learner data to anonymous users"],
            ["Keep guest/local play reliable during network, RLS, schema, or payload failures", "Do not require child login or block gameplay on cloud sync"],
            ["Store optional parent-linked progress with replay-safe events and resumable sessions", "Do not store random generated challenge instances as the content source"],
        ]),
        heading(30, "3. Background and Problem Statement"),
        body_paragraph(31, "The current library is bundled in code and can be mirrored to the original Supabase tables, but the old model does not identify curriculum, grade band, release, revision, surface contract, or publish state. That limits adding P3–P6 or another curriculum safely and makes stale seed counts easy to repeat. The snapshot currently contains 13 subjects, 506 words, and 92 levels under provisional foundation-k-p2 scope; these values are generated from the current library, not an official curriculum claim."),
        body_paragraph(32, "The boundary is intentionally split: Supabase owns published content metadata, revisions, release pointers, RLS, audit fields, and optional learner projections; the browser owns rendering, deterministic generation, local-first state, retry semantics, and fallback. The key invariant is that a remote bundle replaces the local library only when the complete published release passes schema, surface, checksum, and scope validation."),
        heading(33, "4. Proposed Architecture"),
        body_paragraph(35, "Browser App → loadLibrary(curriculumId, gradeBandId, locale) → Supabase anon/RLS → published content release → validated level payload → shared renderer. Parent editor → authenticated RLS → draft revision → review/validator → publish RPC → immutable release pointer. Local answer event → optional queue → record_learning_attempt RPC → append-only attempt + mastery/reward projection."),
        body_paragraph(36, "Figure 1. Source boundary: published Supabase release → validation/cache → Worlds/Mission Map; failure path → bundled library. Parent-linked progress is an optional side channel and never blocks the child loop."),
        make_paragraph(original_paragraphs[38], "Core components"),
        make_table(original_tables[40], [
            ["Component", "Responsibility", "Primary storage", "Failure behavior"],
            ["Content Service", "Loads scope, validates release, hydrates word refs, and exposes authoring methods", "Supabase REST/RPC + localStorage cache", "Use last validated cache or complete bundled library; return warning"],
            ["Content Release", "Publishes curriculum + grade + revision set with checksum and schema version", "content_releases + content_release_levels", "Keep previous release pointer; never partial-publish"],
            ["Level Revision", "Stores draft/review/published payload and surface metadata", "level_revisions + levels compatibility row", "Reject invalid schema/surface before publish"],
            ["Parent Library", "Selects curriculum/grade and manages approved content scope", "Authenticated Supabase RLS", "Read-only local view with explicit source warning"],
            ["Progress Sync", "Queues attempts, calls idempotent RPC, and handles session revisions", "learner_* tables + local queue", "Keep local mastery/reward; show queued or conflict recovery"],
        ]),
        heading(43, "5. Request Lifecycle"),
        body_paragraph(44, "1. Entry — app start or Parent scope change supplies curriculumId, gradeBandId, and locale."),
        body_paragraph(44, "2. Boundary validation — the client queries active curricula, grade bands, a published release, subjects, words, and release-linked levels. The browser uses only the anon key."),
        body_paragraph(44, "3. Normalization — level payloads are checked for schemaVersion 1, canonical surface fields, supported renderer metadata, bounded size, and complete word references."),
        body_paragraph(44, "4. Decision — a complete valid bundle is accepted and cached by releaseId/checksum; an incomplete, invalid, or unavailable response falls back as one complete library."),
        body_paragraph(44, "5. Local learning — renderers validate answer IDs and the local mastery/reward engine updates immediately, including guest play."),
        body_paragraph(44, "6. Optional sync — a parent-linked child sends an event with client_event_id. RPC transaction inserts the attempt once, updates mastery/progress, and records any reward ledger event."),
        body_paragraph(44, "7. Terminal state — the UI reports source, queued, duplicate, synced, or conflict status using a live region; logs contain IDs/status/latency only."),
        heading(52, "6. API and Data Contracts"),
        make_paragraph(original_paragraphs[53], "Primary data contract"),
        make_table(original_tables[55], [
            ["Field", "Type", "Required", "Description"],
            ["curriculumId + gradeBandId", "text + text", "Yes", "Unique published content scope; provisional foundation-k-p2 is not certification."],
            ["releaseId / checksum", "uuid + text", "Yes", "Immutable published pointer and source integrity value."],
            ["schemaVersion", "integer", "Yes", "Payload contract version; current value is 1."],
            ["surface", "object", "Yes", "surfaceId, surfaceKind, surfaceVariant, rendererKey, answerRepresentation."],
            ["client_event_id", "text", "Sync only", "Unique idempotency key for an append-only learner attempt or reward event."],
            ["session revision", "integer", "Resume only", "Optimistic concurrency value for two-device active mission recovery."],
        ]),
        make_paragraph(original_paragraphs[57], "Contract guarantees"),
        body_paragraph(59, "Published content is complete or rejected; anonymous reads never receive draft/review revisions."),
        body_paragraph(60, "Attempts are append-only and deduplicated by client_event_id; reward ledger entries cannot replay."),
        body_paragraph(61, "Release checksum, schema version, revision ID, publisher, and timestamps are retained for audit and rollback."),
        body_paragraph(62, "Supabase is source of truth for published content and optional projections; renderer/generator/mastery/reward behavior remains in code."),
        body_paragraph(63, "The versioned interface is published in supabase/migrations/002_curriculum_and_content_versions.sql and 003_learner_progress.sql."),
        body_paragraph(64, "Update CONTENT-CONTRACT.md, UX-CONTRACT.md, SUPABASE_SETUP.md, validators, and this artifact in the same durable changeset."),
        heading(66, "7. Consistency, Idempotency, and Replay"),
        body_paragraph(68, "Content uses immutable revisions and a release pointer. A publish or rollback changes the pointer, not completed learner history. A client retry with the same client_event_id is accepted as a duplicate-safe no-op. A stale session revision returns session_revision_conflict; the client preserves local state and offers recovery instead of silently overwriting another device."),
        make_table(original_tables[69], [
            ["Scenario", "Expected behavior", "Reasoning"],
            ["Duplicate attempt", "RPC returns duplicate; no second mastery or reward mutation", "client_event_id is unique and the insert/projection is one transaction"],
            ["Network timeout", "Queue locally, keep gameplay and local report available", "Cloud progress is optional and non-blocking"],
            ["Invalid payload", "Reject release and use complete local/cache library", "Prevents a partial or visually drifted content set"],
            ["Two-device resume", "Return session_revision_conflict and show recovery", "Optimistic revision prevents silent data loss"],
        ]),
        heading(71, "8. Security and Privacy Considerations"),
        body_paragraph(73, "Supabase Auth identifies editors/admins and parent owners. RLS exposes only active published content to anonymous users; parent queries are constrained to learner_profiles.parent_user_id = auth.uid()."),
        body_paragraph(74, "Learner attempts are minimized to IDs, correctness, skill, timing, and bounded metadata. Logs must omit child data, tokens, credentials, and raw payload secrets."),
        body_paragraph(75, "The browser receives only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. SUPABASE_SERVICE_ROLE_KEY is server-side seed/import tooling only."),
        body_paragraph(76, "Publish, import, rollback, and learner projection mutations use authenticated RLS or security-definer RPCs with validation and explicit status."),
        body_paragraph(77, "Audit fields record creator/updater/publisher and timestamps. Deletion or reset of local progress remains app-owned; completed history is not rewritten by release rollback."),
        heading(80, "9. Operational Readiness"),
        make_table(original_tables[81], [
            ["Signal", "SLO or alert", "Owner", "Launch gate"],
            ["Published load success", "Complete release accepted; fallback rate visible", "Product Engineering", "Required"],
            ["Content validation", "Zero schema/surface/exact-signature findings", "Content + Engineering", "Required"],
            ["RPC latency/error", "p95 and error rate tracked without learner payload logging", "Platform", "Required"],
            ["Duplicate safety", "Replay fixture never increments mastery/reward twice", "Platform", "Required"],
            ["RLS matrix", "Anon/editor/admin/owner/non-owner fixtures pass", "Security", "Required"],
            ["Offline/recovery", "Queue, retry, rollback, and session conflict tested", "QA", "Required"],
        ]),
        heading(83, "10. Alternatives Considered"),
        make_table(original_tables[86], [
            ["Alternative", "Why it was considered", "Why it was not selected"],
            ["Keep all content in bundled code", "Simple offline deployment and no service dependency", "Does not scale authoring, grade bands, releases, or rollback safely"],
            ["Store every generated challenge in Supabase", "Could make random sessions reproducible from rows", "High volume and couples database storage to code-owned generators"],
            ["Require child login for progress", "Straightforward cloud identity", "Breaks low-friction guest play and is unnecessary for local learning"],
            ["Use service-role key in the browser", "Would simplify writes", "Unsafe; bypasses RLS and exposes all tenant/content data"],
        ]),
        heading(88, "11. Open Questions"),
        body_paragraph(89, "Which named curriculum authority should review and certify the provisional foundation-k-p2 scope before it is marketed as aligned?"),
        body_paragraph(90, "What retention, deletion, export, and consent policy applies to parent-linked learner attempts in each deployment region?"),
        body_paragraph(91, "Should P3–P6 use the same curriculum IDs and locale policy, or should each country/board receive a separate curriculum version?"),
        body_paragraph(92, "Which editor workflow should approve imported payloads before the first production publish, and who owns rollback approval?"),
        heading(94, "12. Decision and Next Steps"),
        body_paragraph(95, "Adopt the two-phase design: first publish versioned Supabase content with complete local/cache fallback; then enable optional parent-linked cloud progress after RLS, replay, conflict, offline, and small-cohort testing. Start with schema and dry-run import, publish the current 13/506/92 snapshot as provisional, add Parent Library scope controls, and only then expand grades through new releases."),
        make_table(original_tables[96], [
            ["Milestone", "Deliverable", "Exit criteria", "Owner"],
            ["M1", "Migrations 002/003 + payload validators", "SQL review, static validation, build, and dry-run pass", "Engineering"],
            ["M2", "Published current snapshot + local fallback", "13 subjects, 506 words, 92 levels and checksum verified", "Platform"],
            ["M3", "Bulk import + Parent Library scope", "Draft/review/private and published/anonymous RLS matrix pass", "Content"],
            ["M4", "Optional cloud progress pilot", "Replay, queue, RLS owner boundary, resume conflict, and offline QA pass", "QA + Security"],
        ]),
    ])

    # Preserve the reference section properties at the end of the document.
    children.append(deepcopy(original_children[-1]))
    for child in list(body):
        body.remove(child)
    for child in children:
        body.append(child)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(REFERENCE, "r") as source_zip:
        with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as target_zip:
            for item in source_zip.infolist():
                data = source_zip.read(item.filename)
                if item.filename == "word/document.xml":
                    data = ET.tostring(document, encoding="utf-8", xml_declaration=True)
                target_zip.writestr(item, data)

print(OUTPUT)
