/**
 * Exports the active set to an audio file by recording the live master output
 * in real time. Playback is driven through the normal set transport (see
 * useSetPlayback), so the recording captures every transition exactly as it
 * sounds live. Recording therefore takes as long as the set's duration.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { AudioEngine, DJSet } from '../../../core';

/** Preferred container/codec for the recorded output. */
const PREFERRED_MIME_TYPE = 'audio/webm;codecs=opus';

/** Fallback container when the preferred codec is unavailable. */
const FALLBACK_MIME_TYPE = 'audio/webm';

/** File extension of the exported audio. */
const EXPORT_EXTENSION = 'webm';

type UseSetExportParams = {
  engine: AudioEngine;
  activeSet: DJSet;
  setIsPlaying: boolean;
  startSetPlayback: () => void;
  stopSetPlayback: () => void;
  toggleTransport: () => Promise<void>;
};

type UseSetExportResult = {
  isExporting: boolean;
  startExport: () => Promise<void>;
  cancelExport: () => void;
};

const pickMimeType = (): string => {
  if (MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)) {
    return PREFERRED_MIME_TYPE;
  }

  return FALLBACK_MIME_TYPE;
};

export const useSetExport = ({
  engine,
  activeSet,
  setIsPlaying,
  startSetPlayback,
  stopSetPlayback,
  toggleTransport,
}: UseSetExportParams): UseSetExportResult => {
  const [isExporting, setIsExporting] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  // True once set playback has actually begun, so the subsequent stop (natural
  // end of the set) can be distinguished from the pre-start idle state.
  const startedRef = useRef(false);
  // Captured at export start so the save dialog can suggest a name even if the
  // set is renamed mid-recording.
  const fileNameRef = useRef('set');

  const finalize = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) {
      return;
    }

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startExport = useCallback(async () => {
    if (isExporting || activeSet.slots.length === 0) {
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      console.error('[export] MediaRecorder is not available.');

      return;
    }

    const stream = await engine.startMasterCapture();
    const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });

    chunksRef.current = [];
    cancelledRef.current = false;
    startedRef.current = false;
    fileNameRef.current = activeSet.name.trim() || 'set';

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      engine.stopMasterCapture();
      const wasCancelled = cancelledRef.current;
      const chunks = chunksRef.current;
      chunksRef.current = [];
      recorderRef.current = null;
      setIsExporting(false);

      if (wasCancelled || chunks.length === 0) {
        return;
      }

      const blob = new Blob(chunks, { type: recorder.mimeType });
      void blob.arrayBuffer().then((buffer) => {
        void window.djApp?.files?.saveAudio(
          `${fileNameRef.current}.${EXPORT_EXTENSION}`,
          new Uint8Array(buffer),
        );
      });
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsExporting(true);
    startSetPlayback();
  }, [isExporting, activeSet.slots.length, activeSet.name, engine, startSetPlayback]);

  const cancelExport = useCallback(() => {
    cancelledRef.current = true;
    if (setIsPlaying) {
      stopSetPlayback();
      void toggleTransport();
    }
    finalize();
  }, [setIsPlaying, stopSetPlayback, toggleTransport, finalize]);

  // Detect the natural end of the set: once playback has begun, a transition
  // back to stopped means the last slot finished — stop the recorder and save.
  useEffect(() => {
    if (!isExporting) {
      return;
    }

    if (setIsPlaying) {
      startedRef.current = true;

      return;
    }

    if (startedRef.current) {
      finalize();
    }
  }, [isExporting, setIsPlaying, finalize]);

  return { isExporting, startExport, cancelExport };
};
