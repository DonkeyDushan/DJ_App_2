/**
 * Discriminated unions describing which library item a pending
 * delete/rename confirmation refers to. Used by the Main page to drive
 * the shared ConfirmDialog and NameInputDialog.
 */

/** A library item targeted for deletion. */
export type DeleteTarget =
  | { kind: 'track-preset'; id: string; name: string }
  | { kind: 'custom-sound'; id: string; name: string }
  | { kind: 'mix'; id: string; name: string }
  | { kind: 'set'; id: string; name: string };

/** A library item targeted for renaming. */
export type RenameTarget =
  | { kind: 'custom-sound'; id: string; name: string }
  | { kind: 'mix'; id: string; name: string }
  | { kind: 'set'; id: string; name: string };
