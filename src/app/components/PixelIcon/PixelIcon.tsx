import type React from 'react';

/**
 * Fixed render size for every pixelart icon, in pixels.
 *
 * Pixelarticons glyphs are authored on a 24px grid; rendering at this exact
 * size keeps the pixel edges crisp. Non-multiple sizes (e.g. 14px) interpolate
 * and blur the artwork, so all icons are pinned to this single value.
 */
const PIXEL_ICON_SIZE_PX = 24;

/**
 * Signature of a pixelarticons React glyph (and our local shims). Matches the
 * components shipped under `pixelarticons/react/*`.
 */
export type PixelGlyph = (
  props: React.SVGProps<SVGSVGElement>,
) => React.ReactElement;

type PixelIconProps = {
  /** The pixelart glyph component to render. */
  glyph: PixelGlyph;
  /** Optional class for layout-only overrides; colour comes from `currentColor`. */
  className?: string;
  /** The size of the icon, in pixels. */
  size?: number;
};

/**
 * Renders a pixelarticons glyph at the fixed 24px grid size with `currentColor`
 * fill, so it inherits its colour from the surrounding MUI control.
 */
export const PixelIcon = ({
  glyph: Glyph,
  className,
  size = PIXEL_ICON_SIZE_PX,
}: PixelIconProps): React.ReactElement => (
  <Glyph
    width={size}
    height={size}
    className={className}
    aria-hidden
    focusable={false}
  />
);
