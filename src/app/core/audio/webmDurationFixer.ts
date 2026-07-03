/**
 * Patches the `Duration` metadata into a WebM blob produced by MediaRecorder.
 *
 * MediaRecorder writes a streaming WebM: the `Segment` element has an unknown
 * size and the `Segment > Info > Duration` element is omitted. Players therefore
 * cannot show the total length or a progress bar. This fixer walks the EBML
 * tree, then either overwrites an existing `Duration` float or inserts one,
 * adjusting the affected element sizes. The audio data itself is untouched.
 *
 * Self-contained on purpose (mirrors the project's custom `wavEncoder`) — no
 * external EBML dependency.
 */

/** EBML element ID for the top-level Segment. */
const ID_SEGMENT = 0x18538067;

/** EBML element ID for Segment > Info. */
const ID_INFO = 0x1549a966;

/** EBML element ID for Info > Duration (a float, in TimestampScale units). */
const ID_DURATION = 0x4489;

/** EBML element ID for Info > TimestampScale (nanoseconds per Duration unit). */
const ID_TIMESTAMP_SCALE = 0x2ad7b1;

/** Default Matroska TimestampScale: 1 ms per unit (1,000,000 ns). */
const DEFAULT_TIMESTAMP_SCALE_NS = 1_000_000;

/** Nanoseconds per millisecond — converts a ms duration to the EBML unit base. */
const NS_PER_MS = 1_000_000;

/** Byte width of the Duration float this fixer inserts when none exists. */
const INSERTED_DURATION_BYTES = 8;

/** Float widths EBML permits for a Duration element. */
const FLOAT32_BYTES = 4;

/**
 * Value of the length-marker bit in a vint's first byte for a given length.
 * EBML encodes the byte count as the position of the highest set bit, so a
 * length-`L` vint has its marker at bit value `2^(8 - L)`. Arithmetic is used
 * throughout this parser instead of bitwise operators to satisfy the lint rules.
 */
const markerBit = (length: number): number => 2 ** (8 - length);

/** Reads how many bytes an EBML variable-length integer occupies. */
const vintLength = (firstByte: number): number => {
  for (let length = 1; length <= 8; length += 1) {
    const marker = markerBit(length);
    if (Math.floor(firstByte / marker) % 2 === 1) {
      return length;
    }
  }

  return 8;
};

type ElementHeader = {
  id: number;
  idLength: number;
  sizePos: number;
  sizeLength: number;
  size: number;
  unknownSize: boolean;
  dataPos: number;
  dataEnd: number;
};

/** Reads an element ID (marker bits retained) at `offset`. */
const readId = (bytes: Uint8Array, offset: number): { id: number; length: number } => {
  const length = vintLength(bytes[offset]);
  let id = 0;
  for (let i = 0; i < length; i += 1) {
    id = id * 256 + bytes[offset + i];
  }

  return { id, length };
};

/** Reads a data-size vint (marker bits stripped) at `offset`. */
const readSize = (
  bytes: Uint8Array,
  offset: number,
): { value: number; length: number; unknown: boolean } => {
  const length = vintLength(bytes[offset]);
  const marker = markerBit(length);
  // The low `8 - length` bits of the first byte hold the high value bits; the
  // marker bit (and any leading-zero length bits) sit above them.
  let value = bytes[offset] % marker;
  let unknown = value === marker - 1;
  for (let i = 1; i < length; i += 1) {
    value = value * 256 + bytes[offset + i];
    if (bytes[offset + i] !== 0xff) {
      unknown = false;
    }
  }

  return { value, length, unknown };
};

/** Parses the element header starting at `pos` within `[ , end)`. */
const readHeader = (bytes: Uint8Array, pos: number, end: number): ElementHeader => {
  const { id, length: idLength } = readId(bytes, pos);
  const sizePos = pos + idLength;
  const { value: size, length: sizeLength, unknown } = readSize(bytes, sizePos);
  const dataPos = sizePos + sizeLength;

  return {
    id,
    idLength,
    sizePos,
    sizeLength,
    size,
    unknownSize: unknown,
    dataPos,
    dataEnd: unknown ? end : dataPos + size,
  };
};

/** Finds the first direct child with `targetId` in `[start, end)`. */
const findChild = (
  bytes: Uint8Array,
  start: number,
  end: number,
  targetId: number,
): ElementHeader | null => {
  let pos = start;
  while (pos < end) {
    const header = readHeader(bytes, pos, end);
    if (header.id === targetId) {
      return header;
    }
    pos = header.dataEnd;
  }

  return null;
};

/** Writes `value` as a fixed-`length` data-size vint (with marker bit) in place. */
const writeSizeInPlace = (
  bytes: Uint8Array,
  offset: number,
  value: number,
  length: number,
): void => {
  let remaining = value;
  for (let i = length - 1; i >= 0; i -= 1) {
    bytes[offset + i] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }
  // The marker-bit position is zero after writing the value, so adding it sets
  // the length marker (equivalent to a bitwise OR here).
  bytes[offset] += markerBit(length);
};

/**
 * Returns a new Blob with the recording's `Duration` (in milliseconds) written
 * into the WebM header. On any parsing failure the original blob is returned so
 * export never breaks — only the metadata enhancement is skipped.
 */
export const fixWebmDuration = async (
  blob: Blob,
  durationMs: number,
): Promise<Blob> => {
  if (!(durationMs > 0)) {
    return blob;
  }

  try {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const end = bytes.length;

    const segment = findChild(bytes, 0, end, ID_SEGMENT);
    if (!segment) {
      return blob;
    }

    const info = findChild(bytes, segment.dataPos, segment.dataEnd, ID_INFO);
    if (!info) {
      return blob;
    }

    const scaleEl = findChild(bytes, info.dataPos, info.dataEnd, ID_TIMESTAMP_SCALE);
    let timestampScale = DEFAULT_TIMESTAMP_SCALE_NS;
    if (scaleEl) {
      let scale = 0;
      for (let i = 0; i < scaleEl.size; i += 1) {
        scale = scale * 256 + bytes[scaleEl.dataPos + i];
      }
      if (scale > 0) {
        timestampScale = scale;
      }
    }

    const durationValue = (durationMs * NS_PER_MS) / timestampScale;

    const existing = findChild(bytes, info.dataPos, info.dataEnd, ID_DURATION);
    if (existing) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      if (existing.size === FLOAT32_BYTES) {
        view.setFloat32(existing.dataPos, durationValue, false);
      } else {
        view.setFloat64(existing.dataPos, durationValue, false);
      }

      return new Blob([bytes], { type: blob.type });
    }

    // Build a new Duration element: ID (0x4489) + size (0x88 = 8) + double.
    const element = new Uint8Array(2 + 1 + INSERTED_DURATION_BYTES);
    element[0] = 0x44;
    element[1] = 0x89;
    // Size vint for a length-8 payload: marker bit (0x80) plus the byte count.
    element[2] = 0x80 + INSERTED_DURATION_BYTES;
    new DataView(element.buffer).setFloat64(3, durationValue, false);

    // Grow the enclosing element sizes by the inserted byte count (same vint
    // length — Info/Segment sizes are far from a length boundary in practice).
    writeSizeInPlace(bytes, info.sizePos, info.size + element.length, info.sizeLength);
    if (!segment.unknownSize) {
      writeSizeInPlace(
        bytes,
        segment.sizePos,
        segment.size + element.length,
        segment.sizeLength,
      );
    }

    const result = new Uint8Array(bytes.length + element.length);
    result.set(bytes.subarray(0, info.dataPos), 0);
    result.set(element, info.dataPos);
    result.set(bytes.subarray(info.dataPos), info.dataPos + element.length);

    return new Blob([result], { type: blob.type });
  } catch (error) {
    console.error('[export] Failed to patch WebM duration', error);

    return blob;
  }
};
