import { useEffect, useRef, useState } from 'react';

import type { CustomSoundRecord } from '../../../core';
import { computeWaveformPeaks } from '../utils/computeWaveformPeaks';
import { WAVEFORM_PEAK_COUNT } from '../constants/trimDimensions';
import type { DecodedSound } from '../types/trimEditor';

const EMPTY_PEAKS = new Float32Array(0);

const INITIAL_STATE: DecodedSound = {
  context: null,
  buffer: null,
  duration: 0,
  peaks: EMPTY_PEAKS,
  isLoading: false,
};

/**
 * Decodes a custom sound's Blob into an AudioBuffer and precomputes waveform
 * peaks, owning a single AudioContext for both decoding and preview playback.
 * The context is closed when the consumer unmounts.
 */
export const useDecodedSound = (sound: CustomSoundRecord): DecodedSound => {
  const contextRef = useRef<AudioContext | null>(null);
  const [state, setState] = useState<DecodedSound>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;

    setState((current) => ({ ...current, isLoading: true }));

    void (async () => {
      try {
        const arrayBuffer = await sound.blob.arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        if (cancelled) return;

        setState({
          context,
          buffer,
          duration: buffer.duration,
          peaks: computeWaveformPeaks(buffer, WAVEFORM_PEAK_COUNT),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;

        setState({ ...INITIAL_STATE, context });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sound]);

  useEffect(
    () => () => {
      void contextRef.current?.close();
      contextRef.current = null;
    },
    [],
  );

  return state;
};
