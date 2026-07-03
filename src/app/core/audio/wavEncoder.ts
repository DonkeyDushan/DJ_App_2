/**
 * Encodes a region of a decoded AudioBuffer into an uncompressed 16-bit PCM
 * WAV Blob. Used when a custom sound is trimmed: the kept region is re-encoded
 * to WAV so it can be stored and re-decoded by the Web Audio API on any
 * platform without depending on a format-specific encoder.
 */

/** Bytes per sample for 16-bit PCM output. */
const BYTES_PER_SAMPLE = 2;

/** Bit depth of the exported PCM data. */
const BITS_PER_SAMPLE = 16;

/** Size of the canonical 44-byte RIFF/WAVE header preceding the sample data. */
const WAV_HEADER_BYTES = 44;

/** WAV format code for uncompressed integer PCM. */
const PCM_FORMAT_CODE = 1;

/** Peak positive amplitude of a signed 16-bit sample (32767). */
const INT16_MAX = 0x7fff;

/** Bits in a byte — used to derive the byte rate field. */
const BITS_PER_BYTE = 8;

/** MIME type of the exported audio data. */
export const WAV_MIME_TYPE = 'audio/wav';

const clampSample = (value: number, length: number): number =>
  Math.max(0, Math.min(length, value));

const writeAscii = (view: DataView, offset: number, text: string): void => {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
};

const writeWavHeader = (
  view: DataView,
  sampleRate: number,
  channelCount: number,
  dataBytes: number,
): void => {
  const blockAlign = channelCount * BYTES_PER_SAMPLE;
  const byteRate = sampleRate * blockAlign;

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, WAV_HEADER_BYTES - BITS_PER_BYTE + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size for PCM
  view.setUint16(20, PCM_FORMAT_CODE, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);
};

/**
 * Returns a WAV Blob containing only the samples between `startSeconds` and
 * `endSeconds` of `buffer`. Channels are interleaved and clamped to the valid
 * signed-16-bit range. Bounds are clamped to the buffer, so callers may pass a
 * slightly out-of-range selection safely.
 */
export const encodeWavRegion = (
  buffer: AudioBuffer,
  startSeconds: number,
  endSeconds: number,
): Blob => {
  const { sampleRate, numberOfChannels } = buffer;
  const startSample = clampSample(
    Math.floor(startSeconds * sampleRate),
    buffer.length,
  );
  const endSample = clampSample(
    Math.ceil(endSeconds * sampleRate),
    buffer.length,
  );
  const frameCount = Math.max(0, endSample - startSample);
  const dataBytes = frameCount * numberOfChannels * BYTES_PER_SAMPLE;

  const arrayBuffer = new ArrayBuffer(WAV_HEADER_BYTES + dataBytes);
  const view = new DataView(arrayBuffer);

  writeWavHeader(view, sampleRate, numberOfChannels, dataBytes);

  // Cache channel views once before the interleave loop to avoid per-sample
  // method calls and allocations.
  const channels: Float32Array[] = [];
  for (let c = 0; c < numberOfChannels; c += 1) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = WAV_HEADER_BYTES;
  for (let i = startSample; i < endSample; i += 1) {
    for (let c = 0; c < numberOfChannels; c += 1) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, Math.round(sample * INT16_MAX), true);
      offset += BYTES_PER_SAMPLE;
    }
  }

  return new Blob([arrayBuffer], { type: WAV_MIME_TYPE });
};
