/**
 * Pure helpers for naming a duplicated mix with a trailing sequence number.
 * No side effects, no React hooks.
 */

import type { SavedMix } from '../../../core/types/mixData';

/**
 * Lowest sequence number assigned to a base name that carries no explicit
 * number — `"House Vibes"` is treated as `"House Vibes" #1` for comparison.
 */
const IMPLICIT_BASE_SEQUENCE = 1;

/** Matches a trailing space-separated integer, e.g. `"House Vibes 2"` → `2`. */
const TRAILING_SEQUENCE_REGEX = /^(.*\S)\s+(\d+)$/;

interface ParsedMixName {
  /** Name with any trailing sequence number stripped. */
  baseName: string;
  /** Parsed sequence number, or the implicit base when none is present. */
  sequence: number;
}

/**
 * Splits a mix name into its base and trailing sequence number. A name without
 * a trailing number resolves to {@link IMPLICIT_BASE_SEQUENCE}.
 */
const parseMixName = (name: string): ParsedMixName => {
  const match = TRAILING_SEQUENCE_REGEX.exec(name.trim());
  if (match === null) {
    return { baseName: name.trim(), sequence: IMPLICIT_BASE_SEQUENCE };
  }

  return { baseName: match[1], sequence: Number(match[2]) };
};

/**
 * Builds the name for a duplicate of `source`. The copy shares the source's
 * base name and receives a sequence number one greater than the highest number
 * already used by any existing mix sharing that base name.
 */
export const buildDuplicateMixName = (
  source: SavedMix,
  existingMixes: readonly SavedMix[],
): string => {
  const { baseName } = parseMixName(source.name);

  let highestSequence = IMPLICIT_BASE_SEQUENCE;
  for (const mix of existingMixes) {
    const parsed = parseMixName(mix.name);
    if (parsed.baseName !== baseName) continue;
    if (parsed.sequence > highestSequence) highestSequence = parsed.sequence;
  }

  return `${baseName} ${highestSequence + 1}`;
};
