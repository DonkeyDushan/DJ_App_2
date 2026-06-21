import type React from 'react';

import type { PixelGlyph } from './PixelIcon';

/**
 * Pixelarticons ships no pause glyph, so this fills the gap in the matching
 * style: two solid bars on the set's native 24px grid. Used wherever a
 * play/pause toggle needs to show the paused state. Spread props last so the
 * caller (e.g. `PixelIcon`) can override `width`/`height`.
 */
export const PausePixelGlyph: PixelGlyph = (
  props: React.SVGProps<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
  </svg>
);
