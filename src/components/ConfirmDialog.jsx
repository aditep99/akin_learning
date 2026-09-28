import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmLabel = "Confirm",
  description,
  error = "",
  id = "confirm-dialog",
  isBusy = false,
  onCancel,
  onConfirm,
  title,
  tone = "warning",
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const isBusyRef = useRef(isBusy);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    isBusyRef.current = isBusy;
    onCancelRef.current = onCancel;
  }, [isBusy, onCancel]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = () => {
      cancelRef.current?.focus();
    };

    const timeoutId = window.setTimeout(focusDialog, 0);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isBusyRef.current) {
          onCancelRef.current?.();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown, true);

      if (restoreFocusRef.current instanceof HTMLElement) {
        window.setTimeout(() => restoreFocusRef.current?.focus(), 0);
      }
    };
  }, []);

  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className="confirm-dialog" role="presentation">
      <div className="confirm-dialog__backdrop" aria-hidden="true" />
      <section
        ref={dialogRef}
        className={`confirm-dialog__card confirm-dialog__card--${tone}`.trim()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
      >
        <span className="confirm-dialog__icon" aria-hidden="true">
          {tone === "danger" ? "!" : "✦"}
        </span>
        <p className="eyebrow">Akin needs your choice</p>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        {children}
        {error ? (
          <p id={errorId} className="confirm-dialog__error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="confirm-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-dialog__cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog__confirm confirm-dialog__confirm--${tone}`.trim()}
            onClick={onConfirm}
            disabled={isBusy}
            aria-busy={isBusy || undefined}
          >
            {isBusy ? "Working…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
