/**
 * A set switch the user requested while the current set had unsaved changes.
 * Held pending until the user resolves the unsaved-changes prompt (save or
 * discard), then executed.
 * - 'load': load a specific saved set as the active set.
 * - 'new': start a fresh, empty set ("New set").
 */
export type PendingSetSwitch =
  | { kind: 'load'; setId: string }
  | { kind: 'new' };
