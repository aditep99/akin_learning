import { useMemo, useState } from "react";
import monsterMint from "../assets/characters/buddy-monster-mint.svg";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ScreenShell } from "../components/ScreenShell";
import { getPronunciationData } from "../utils/pronunciation";
import { getWordImage } from "../utils/wordImage";

function emptyWordForm() {
  return {
    emoji: "",
    imageFile: null,
    phonics: "",
    pronunciationGuide: "",
    pronunciationIpa: "",
    translation: "",
    word: "",
  };
}

function formFromWord(word) {
  return {
    emoji: word.emoji || "",
    imageFile: null,
    phonics: word.phonics || "",
    pronunciationGuide: word.pronunciation?.guide || "",
    pronunciationIpa: word.pronunciation?.ipa || "",
    translation: word.translation || "",
    word: word.word || "",
  };
}

function WordFields({ form, idPrefix, onChange }) {
  return (
    <div className="parent-word-fields">
      <label>
        <span>Word</span>
        <input
          id={`${idPrefix}-word`}
          name="word"
          value={form.word}
          onChange={(event) => onChange("word", event.target.value)}
          placeholder="elephant"
          required
        />
      </label>
      <label>
        <span>Emoji</span>
        <input
          id={`${idPrefix}-emoji`}
          name="emoji"
          value={form.emoji}
          onChange={(event) => onChange("emoji", event.target.value)}
          placeholder="🐘"
        />
      </label>
      <label>
        <span>Phonics</span>
        <input
          id={`${idPrefix}-phonics`}
          name="phonics"
          value={form.phonics}
          onChange={(event) => onChange("phonics", event.target.value)}
          placeholder="EL-uh-fuhnt"
        />
      </label>
      <label>
        <span>Syllables</span>
        <input
          id={`${idPrefix}-guide`}
          name="pronunciationGuide"
          value={form.pronunciationGuide}
          onChange={(event) =>
            onChange("pronunciationGuide", event.target.value)
          }
          placeholder="el·e·phant"
        />
      </label>
      <label>
        <span>IPA</span>
        <input
          id={`${idPrefix}-ipa`}
          name="pronunciationIpa"
          value={form.pronunciationIpa}
          onChange={(event) =>
            onChange("pronunciationIpa", event.target.value)
          }
          placeholder="/ˈeləfənt/"
        />
      </label>
      <label>
        <span>Thai</span>
        <input
          id={`${idPrefix}-translation`}
          name="translation"
          value={form.translation}
          onChange={(event) => onChange("translation", event.target.value)}
          placeholder="ช้าง"
        />
      </label>
      <label className="parent-image-field" htmlFor={`${idPrefix}-image`}>
        <span>Image · PNG/JPEG/WebP · max 5MB</span>
        <input
          id={`${idPrefix}-image`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) =>
            onChange("imageFile", event.target.files?.[0] || null)
          }
        />
      </label>
    </div>
  );
}

export function LibraryScreen({
  isLoading,
  library,
  onAddSubject,
  onAddWord,
  onBack,
  onDeleteWord,
  onLogout,
  onPress,
  onUpdateWord,
  contentReleaseId = null,
  contentScope = { curriculumId: "", gradeBandId: "" },
  curricula = [],
  gradeBands = [],
  onSelectContentScope,
  source,
  warning,
}) {
  const [subjectForm, setSubjectForm] = useState({
    description: "",
    icon: "📚",
    name: "",
    worldLabel: "",
  });
  const [wordForms, setWordForms] = useState({});
  const [editingWord, setEditingWord] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyWordForm());
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [operation, setOperation] = useState({
    error: "",
    isSaving: false,
    message: "",
  });
  const isWritable = source === "supabase";
  const totalWords = useMemo(
    () =>
      library.reduce(
        (count, subject) => count + (subject.words?.length || 0),
        0,
      ),
    [library],
  );

  const runMutation = async (action, successMessage) => {
    setOperation({ error: "", isSaving: true, message: "" });

    try {
      const result = await action();
      setOperation({ error: "", isSaving: false, message: successMessage });
      return result;
    } catch {
      setOperation({
        error: "The change could not be saved. Check your connection and try again.",
        isSaving: false,
        message: "",
      });
      throw error;
    }
  };

  const updateWordForm = (subjectId, field, value) => {
    setWordForms((current) => ({
      ...current,
      [subjectId]: {
        ...emptyWordForm(),
        ...current[subjectId],
        [field]: value,
      },
    }));
  };

  const submitSubject = async (event) => {
    event.preventDefault();
    if (!subjectForm.name.trim()) {
      setOperation({
        error: "Enter a subject name before saving.",
        isSaving: false,
        message: "",
      });
      event.currentTarget.querySelector('[name="subject-name"]')?.focus();
      return;
    }

    if (!isWritable) {
      return;
    }

    onPress();
    try {
      await runMutation(
        () => onAddSubject(subjectForm),
        "เพิ่มหมวดใหม่แล้ว",
      );
      setSubjectForm({
        description: "",
        icon: "📚",
        name: "",
        worldLabel: "",
      });
    } catch {
      // The visible error state is set by runMutation.
    }
  };

  const submitWord = async (event, subjectId) => {
    event.preventDefault();
    const form = wordForms[subjectId] || emptyWordForm();

    if (!form.word.trim()) {
      setOperation({
        error: "Enter a word before saving.",
        isSaving: false,
        message: "",
      });
      event.currentTarget.querySelector('[name="word"]')?.focus();
      return;
    }

    if (!isWritable) {
      return;
    }

    onPress();
    try {
      await runMutation(
        () => onAddWord(subjectId, form, form.imageFile),
        `เพิ่มคำว่า ${form.word.trim()} แล้ว`,
      );
      setWordForms((current) => ({
        ...current,
        [subjectId]: emptyWordForm(),
      }));
    } catch {
      // The visible error state is set by runMutation.
    }
  };

  const saveWord = async (subjectId) => {
    if (!editingWord) {
      return;
    }

    if (!editingForm.word.trim()) {
      setOperation({
        error: "Enter a word before saving.",
        isSaving: false,
        message: "",
      });
      document.getElementById(`edit-${editingWord.id}-word`)?.focus();
      return;
    }

    if (!isWritable) {
      return;
    }

    onPress();
    try {
      await runMutation(
        () =>
          onUpdateWord(
            subjectId,
            editingWord,
            editingForm,
            editingForm.imageFile,
          ),
        `บันทึกคำว่า ${editingForm.word.trim()} แล้ว`,
      );
      setEditingWord(null);
      setEditingForm(emptyWordForm());
    } catch {
      // The visible error state is set by runMutation.
    }
  };

  const removeWord = (subjectId, word) => {
    if (!isWritable) {
      return;
    }

    setOperation((current) => ({ ...current, error: "" }));
    setDeleteRequest({ subjectId, word });
  };

  const confirmRemoveWord = async () => {
    if (!deleteRequest || !isWritable) {
      return;
    }

    const { subjectId, word } = deleteRequest;

    onPress();
    try {
      await runMutation(
        () => onDeleteWord(subjectId, word),
        `ลบคำว่า ${word.word} แล้ว`,
      );
      if (editingWord?.id === word.id) {
        setEditingWord(null);
      }
      setDeleteRequest(null);
      window.setTimeout(() => {
        document.getElementById(`subject-${subjectId}-summary`)?.focus();
      }, 0);
    } catch {
      // The visible error state is set by runMutation.
    }
  };

  return (
    <ScreenShell
      className="screen-shell--parent-library"
      variant="ParentToolShell"
    >
      <header className="parent-library-header">
        <button type="button" className="parent-back-button" onClick={onBack}>
          ← กลับหน้าเด็ก
        </button>
        <div className="parent-library-header__title">
          <img src={monsterMint} alt="" />
          <div>
            <span>Parent / Teacher Mode</span>
            <h1>Learning Library</h1>
            <p>
              {library.length} subjects · {totalWords} words
            </p>
          </div>
        </div>
        <div className="parent-library-header__actions">
          <span
            className={`parent-source-badge parent-source-badge--${source}`}
          >
            {source === "supabase" ? "● Cloud connected" : "○ Local fallback"}
          </span>
          <button type="button" className="parent-secondary-button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {warning ? (
        <div className="parent-alert parent-alert--warning" role="status">
          <strong>Read-only mode</strong>
          <span>{warning}</span>
        </div>
      ) : null}
      {operation.error ? (
        <div className="parent-alert parent-alert--error" role="alert">
          {operation.error}
        </div>
      ) : null}
      {operation.message ? (
        <div className="parent-alert parent-alert--success" role="status">
          {operation.message}
        </div>
      ) : null}

      <section className="parent-content-scope" aria-labelledby="content-scope-title">
        <div>
          <span className="parent-section-kicker">Versioned content</span>
          <h2 id="content-scope-title">Curriculum and grade band</h2>
          <p>
            Published releases are read by the child app. Draft imports stay private until an editor publishes them.
          </p>
        </div>
        <div className="parent-content-scope__fields">
          <label>
            <span>Curriculum</span>
            <select
              value={contentScope.curriculumId || ""}
              disabled={!isWritable || isLoading || curricula.length === 0}
              onChange={(event) => {
                const nextCurriculumId = event.target.value;
                const nextGradeBand = gradeBands.find(
                  (band) => band.curriculumId === nextCurriculumId,
                );
                onSelectContentScope?.({
                  curriculumId: nextCurriculumId,
                  gradeBandId: nextGradeBand?.id || "",
                });
              }}
            >
              {curricula.length === 0 ? (
                <option value="">No published curricula</option>
              ) : null}
              {curricula.map((curriculum) => (
                <option key={curriculum.id} value={curriculum.id}>
                  {curriculum.name} · {curriculum.version}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Grade band</span>
            <select
              value={contentScope.gradeBandId || ""}
              disabled={!isWritable || isLoading || gradeBands.length === 0}
              onChange={(event) =>
                onSelectContentScope?.({
                  ...contentScope,
                  gradeBandId: event.target.value,
                })
              }
            >
              {gradeBands.length === 0 ? (
                <option value="">No grade bands</option>
              ) : null}
              {gradeBands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <small>
          {contentReleaseId
            ? `Published release: ${contentReleaseId}`
            : "No published release selected. The child app will use the bundled fallback."}
        </small>
      </section>

      {isLoading ? (
        <section className="parent-loading-card" aria-live="polite">
          กำลังโหลดคลังการเรียนรู้…
        </section>
      ) : (
        <div className="parent-library-layout">
          <aside className="parent-subject-create">
            <span className="parent-section-kicker">New subject</span>
            <h2>เพิ่มหมวดการเรียน</h2>
            <form onSubmit={submitSubject} noValidate>
              <label>
                <span>Name</span>
                <input
                  id="parent-subject-name"
                  name="subject-name"
                  value={subjectForm.name}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                <span>World name</span>
                <input
                  value={subjectForm.worldLabel}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      worldLabel: event.target.value,
                    }))
                  }
                  placeholder="Ocean Adventure"
                />
              </label>
              <label>
                <span>Icon</span>
                <input
                  value={subjectForm.icon}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      icon: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  className="parent-form-textarea resize-none"
                  value={subjectForm.description}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows="3"
                />
              </label>
              <button
                type="submit"
                className="parent-primary-button"
                disabled={!isWritable || operation.isSaving}
                aria-busy={operation.isSaving || undefined}
              >
                {operation.isSaving ? "Saving…" : "Add subject"}
              </button>
            </form>
          </aside>

          <main className="parent-subject-list">
            {library.map((subject) => {
              const form = wordForms[subject.id] || emptyWordForm();

              return (
                <details className="parent-subject-card" key={subject.id}>
                  <summary id={`subject-${subject.id}-summary`}>
                    <span className="parent-subject-card__icon">{subject.icon}</span>
                    <span>
                      <strong>{subject.worldLabel || subject.name}</strong>
                      <small>
                        {subject.name} · {subject.words?.length || 0} words
                      </small>
                    </span>
                    <b>Manage</b>
                  </summary>

                  <div className="parent-word-grid">
                    {(subject.words || []).map((word) => {
                      const pronunciation = getPronunciationData(word);
                      const image = getWordImage(word);
                      const isEditing = editingWord?.id === word.id;

                      return (
                        <article className="parent-word-card" key={word.id}>
                          <div className="parent-word-card__visual">
                            {image ? (
                              <img src={image} alt={word.word} loading="lazy" />
                            ) : (
                              <span>{word.emoji || "✨"}</span>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="parent-word-editor">
                              <WordFields
                                form={editingForm}
                                idPrefix={`edit-${word.id}`}
                                onChange={(field, value) =>
                                  setEditingForm((current) => ({
                                    ...current,
                                    [field]: value,
                                  }))
                                }
                              />
                              <div className="parent-word-card__actions">
                                <button
                                  type="button"
                                  className="parent-primary-button"
                                  disabled={operation.isSaving}
                                  aria-busy={operation.isSaving || undefined}
                                  onClick={() => saveWord(subject.id)}
                                >
                                  {operation.isSaving ? "Saving…" : "Save"}
                                </button>
                                <button
                                  type="button"
                                  className="parent-secondary-button"
                                  onClick={() => setEditingWord(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="parent-word-card__copy">
                                <strong>{word.word}</strong>
                                {pronunciation.guide ? (
                                  <span>{pronunciation.guide}</span>
                                ) : null}
                                {pronunciation.ipa ? (
                                  <small>{pronunciation.ipa}</small>
                                ) : null}
                                {word.translation ? <p>{word.translation}</p> : null}
                              </div>
                              <div className="parent-word-card__actions">
                                <button
                                  type="button"
                                  className="parent-secondary-button"
                                  disabled={!isWritable}
                                  onClick={() => {
                                    setEditingWord(word);
                                    setEditingForm(formFromWord(word));
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="parent-danger-button"
                                  disabled={!isWritable || operation.isSaving}
                                  onClick={() => removeWord(subject.id, word)}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </article>
                      );
                    })}
                  </div>

                  <form
                    className="parent-add-word"
                    onSubmit={(event) => submitWord(event, subject.id)}
                    noValidate
                  >
                    <div>
                      <span className="parent-section-kicker">Add word</span>
                      <h3>{subject.name}</h3>
                    </div>
                    <WordFields
                      form={form}
                      idPrefix={`new-${subject.id}`}
                      onChange={(field, value) =>
                        updateWordForm(subject.id, field, value)
                      }
                    />
                    <button
                      type="submit"
                      className="parent-primary-button"
                      disabled={!isWritable || operation.isSaving}
                      aria-busy={operation.isSaving || undefined}
                    >
                      {operation.isSaving ? "Saving…" : "Add word"}
                    </button>
                  </form>
                </details>
              );
            })}
          </main>
        </div>
      )}
      {deleteRequest ? (
        <ConfirmDialog
          cancelLabel="Keep Word"
          confirmLabel="Delete"
          description={`Delete “${deleteRequest.word.word}” from the learning library? This removes it from the cloud library and cannot be undone here.`}
          error={operation.error}
          id="delete-library-word-dialog"
          isBusy={operation.isSaving}
          onCancel={() => {
            if (!operation.isSaving) {
              setDeleteRequest(null);
              setOperation((current) => ({ ...current, error: "" }));
            }
          }}
          onConfirm={confirmRemoveWord}
          title="Delete this word?"
          tone="danger"
        />
      ) : null}
    </ScreenShell>
  );
}
