/**
 * The saved mix currently being edited in the MixEditDialog, along with the
 * working name and accent color shown in that dialog.
 */

import type { MixColorKey } from '../../../core';

export type MixEditTarget = {
  id: string;
  name: string;
  color: MixColorKey | null;
};
