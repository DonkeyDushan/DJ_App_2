/**
 * A mix switch the user requested while the current mix had unsaved changes.
 * Held pending until the user resolves the unsaved-changes prompt (save,
 * save-new, or discard), then executed.
 * - 'load': load a specific saved mix into the mixer.
 * - 'new': start a fresh, empty mix ("New mix").
 */
export type PendingMixSwitch =
  | { kind: 'load'; mixId: string }
  | { kind: 'new' };
