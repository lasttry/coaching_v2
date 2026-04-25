'use client';

/**
 * GuardedDialog
 * -------------
 * Drop-in replacement for MUI's <Dialog> that protects unsaved form data
 * from being accidentally lost when the user dismisses the dialog through
 * the escape key, a backdrop click, the close (X) button or any other
 * cancel-like action.
 *
 * Design goals:
 *  - Zero behaviour change when the dialog is "clean" (no unsaved edits).
 *  - Single, app-wide confirmation copy that respects i18n.
 *  - Easy to retrofit existing dialogs: change `<Dialog>` to
 *    `<GuardedDialog isDirty={someBool}>` and route the cancel button
 *    through the same `onClose` (or use the exposed hook for full control).
 *
 * Two integration paths are supported:
 *  1. **Wrapper component** – pass `isDirty` and `onClose`; the wrapper
 *     handles every dismissal source for you.
 *  2. **`useUnsavedChangesGuard()` hook** – returns a `requestClose()`
 *     helper plus a `<DiscardChangesPrompt>` element you can render
 *     anywhere; useful when the parent owns a custom dialog implementation.
 *
 * To compute `isDirty` cheaply, the companion `useFormSnapshotDirty`
 * hook snapshots the form value when the dialog opens and deep-compares
 * (via stable JSON serialisation) on every render. Forms whose state is
 * not JSON-serialisable should pass an explicit `isDirty` instead.
 */

import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

type DialogCloseReason = 'backdropClick' | 'escapeKeyDown' | 'closeButton';

interface UnsavedChangesGuardOptions {
  /** When true, dismiss attempts ask for confirmation first. */
  isDirty: boolean;
  /** Disable the guard entirely (handy for read-only dialogs). */
  disabled?: boolean;
  /** Optional override for the dialog title. */
  titleOverride?: string;
  /** Optional override for the body copy. */
  messageOverride?: string;
  /** Optional override for the destructive button label. */
  confirmLabelOverride?: string;
}

interface UnsavedChangesGuardApi {
  /**
   * Wraps a "raw" close handler so it routes through the confirmation
   * step when there are unsaved changes. Pass the underlying close
   * function (typically a no-arg setter) and call the returned function
   * from any cancel-like action.
   */
  requestClose: (rawClose: () => void) => void;
  /**
   * Render this somewhere inside the parent tree (typically right next
   * to the dialog being guarded) so the confirmation dialog has a host.
   */
  prompt: ReactElement;
  /** True while the confirmation dialog is currently visible. */
  promptOpen: boolean;
}

/**
 * Imperative confirmation guard. Use this when the wrapper component
 * does not fit (e.g. custom Drawer, popovers or non-MUI surfaces).
 */
export function useUnsavedChangesGuard(
  options: UnsavedChangesGuardOptions
): UnsavedChangesGuardApi {
  const { isDirty, disabled, titleOverride, messageOverride, confirmLabelOverride } = options;
  const { t } = useTranslation();

  const [promptOpen, setPromptOpen] = useState(false);
  // Pending close action is stored in a ref to avoid stale-closure issues
  // when the consumer re-renders mid confirmation.
  const pendingCloseRef = useRef<(() => void) | null>(null);

  const requestClose = useCallback(
    (rawClose: () => void) => {
      if (disabled || !isDirty) {
        rawClose();
        return;
      }
      pendingCloseRef.current = rawClose;
      setPromptOpen(true);
    },
    [disabled, isDirty]
  );

  const handleKeepEditing = useCallback(() => {
    pendingCloseRef.current = null;
    setPromptOpen(false);
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    const close = pendingCloseRef.current;
    pendingCloseRef.current = null;
    setPromptOpen(false);
    if (close) close();
  }, []);

  const prompt = useMemo(
    () => (
      <Dialog open={promptOpen} onClose={handleKeepEditing} maxWidth="xs" fullWidth>
        <DialogTitle>{titleOverride ?? t('discardChanges.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{messageOverride ?? t('discardChanges.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeepEditing} autoFocus>
            {t('discardChanges.keepEditing')}
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDiscard}>
            {confirmLabelOverride ?? t('discardChanges.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [
      promptOpen,
      handleKeepEditing,
      handleConfirmDiscard,
      titleOverride,
      messageOverride,
      confirmLabelOverride,
      t,
    ]
  );

  return { requestClose, prompt, promptOpen };
}

interface GuardedDialogProps extends Omit<DialogProps, 'onClose'> {
  /** When true, dismiss attempts trigger a confirmation prompt. */
  isDirty?: boolean;
  /** Disable guard logic regardless of `isDirty`. */
  guardDisabled?: boolean;
  /** Confirmation copy overrides. */
  discardTitle?: string;
  discardMessage?: string;
  discardConfirmLabel?: string;
  /**
   * Real close handler – called once the user has confirmed the discard
   * (or immediately when the dialog is clean / guard disabled).
   * Receives no arguments to keep the integration trivial.
   */
  onClose?: () => void;
  children: ReactNode;
}

/**
 * MUI `<Dialog>` wrapper that asks the user before closing when there
 * are unsaved edits. All other Dialog props are forwarded as-is.
 */
export function GuardedDialog({
  isDirty = false,
  guardDisabled = false,
  discardTitle,
  discardMessage,
  discardConfirmLabel,
  onClose,
  children,
  ...dialogProps
}: GuardedDialogProps): ReactElement {
  const { requestClose, prompt } = useUnsavedChangesGuard({
    isDirty: !!isDirty,
    disabled: guardDisabled,
    titleOverride: discardTitle,
    messageOverride: discardMessage,
    confirmLabelOverride: discardConfirmLabel,
  });

  // MUI dispatches `onClose(event, reason)`; we only care about whether a
  // close was attempted. The consumer's onClose stays argument-less so the
  // existing `() => setOpen(false)` style continues to work everywhere.
  const handleDialogClose = useCallback(
    (_event: object, _reason: DialogCloseReason) => {
      if (!onClose) return;
      requestClose(onClose);
    },
    [onClose, requestClose]
  );

  return (
    <>
      <Dialog {...dialogProps} onClose={handleDialogClose}>
        {children}
      </Dialog>
      {prompt}
    </>
  );
}

/**
 * Stable JSON serialiser that ignores key insertion order so that
 * `{a:1,b:2}` and `{b:2,a:1}` are considered equal. Functions and
 * `undefined` are skipped to mirror `JSON.stringify` behaviour.
 */
function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  const serialise = (input: unknown): unknown => {
    if (input === null || typeof input !== 'object') return input;
    if (seen.has(input as object)) return null; // circular guard
    seen.add(input as object);
    if (Array.isArray(input)) return input.map(serialise);
    const obj = input as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      const v = obj[key];
      if (typeof v === 'function' || typeof v === 'undefined') continue;
      out[key] = serialise(v);
    }
    return out;
  };
  try {
    return JSON.stringify(serialise(value));
  } catch {
    // Fallback: best-effort, unstable but never throws.
    return String(value);
  }
}

/**
 * Snapshots `value` whenever `open` transitions to `true` and reports
 * whether the live value diverges from the snapshot. Use this to wire
 * `<GuardedDialog isDirty={...}>` to an existing form state object.
 *
 * The form state must be JSON-serialisable. If your form holds large
 * binary blobs or DOM nodes pass `isDirty` explicitly instead.
 */
export function useFormSnapshotDirty<T>(open: boolean, value: T): boolean {
  const snapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      snapshotRef.current = stableStringify(value);
    } else {
      // Reset so the next opening grabs a fresh baseline.
      snapshotRef.current = null;
    }
    // We intentionally do not depend on `value` here; the snapshot must
    // only be taken at the moment the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return useMemo(() => {
    if (!open) return false;
    if (snapshotRef.current === null) return false;
    return snapshotRef.current !== stableStringify(value);
  }, [open, value]);
}

export default GuardedDialog;
