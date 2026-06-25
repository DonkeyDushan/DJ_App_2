/**
 * Reduces a decoded AudioBuffer to a fixed number of absolute-peak buckets for
 * waveform rendering. Pure, runs once per opened sound — not in a render loop.
 */

/**
 * Returns `peakCount` normalised peaks (0..1) sampled from the first channel of
 * `buffer`. Each peak is the maximum absolute amplitude within its bucket, so
 * transients remain visible regardless of bucket size.
 */
export const computeWaveformPeaks = (
  buffer: AudioBuffer,
  peakCount: number,
): Float32Array => {
  const channel = buffer.getChannelData(0);
  const peaks = new Float32Array(peakCount);

  if (channel.length === 0) {
    return peaks;
  }

  const samplesPerPeak = Math.max(1, Math.floor(channel.length / peakCount));

  for (let i = 0; i < peakCount; i += 1) {
    const start = i * samplesPerPeak;
    const end = Math.min(channel.length, start + samplesPerPeak);
    let max = 0;

    for (let j = start; j < end; j += 1) {
      const abs = Math.abs(channel[j]);
      if (abs > max) max = abs;
    }

    peaks[i] = max;
  }

  return peaks;
};
