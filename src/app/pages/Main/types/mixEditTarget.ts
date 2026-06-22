/**
 * Discriminated union representing the current state of the MixEditDialog.
 * - 'create': user is saving a new mix for the first time.
 * - 'edit': user is renaming / recoloring an existing saved mix.
 */

import type { MixColorKey } from '../../../core';

export type MixDialogState =
  | { kind: 'create'; initialName: string }
  | { kind: 'edit'; id: string; name: string; color: MixColorKey | null };
