/**
 * Pure factory functions for constructing and connecting Web Audio nodes.
 * No state, no side effects beyond the AudioContext graph mutations.
 */

import type { TrackState } from '../types/trackData';
import type { PlaybackHandle } from './audioTypes';
import {
  EQ_HIGH_FREQ_HZ,
  EQ_LOW_FREQ_HZ,
  EQ_MID_FREQ_HZ,
  EQ_MID_Q,
} from './audioConstants';

/**
 * Creates a fully-wired PlaybackHandle for a single track playback instance.
 * Connects: source → EQ chain → gainNode → masterGain (+ optional reverb/delay sends).
 */
export const createPlaybackHandle = (
  context: AudioContext,
  masterGain: GainNode,
  reverbInputGain: GainNode | null,
  delayInputGain: GainNode | null,
  trackId: string,
  buffer: AudioBuffer,
  trackState: TrackState,
  effectiveRate: number,
  oneShot: boolean,
): PlaybackHandle => {
  const source = context.createBufferSource();
  const gainNode = context.createGain();
  const eqLowNode = context.createBiquadFilter();
  const eqMidNode = context.createBiquadFilter();
  const eqHighNode = context.createBiquadFilter();
  const reverbSendNode = context.createGain();
  const delaySendNode = context.createGain();

  eqLowNode.type = 'lowshelf';
  eqLowNode.frequency.value = EQ_LOW_FREQ_HZ;
  eqLowNode.gain.value = trackState.eqLow;

  eqMidNode.type = 'peaking';
  eqMidNode.frequency.value = EQ_MID_FREQ_HZ;
  eqMidNode.Q.value = EQ_MID_Q;
  eqMidNode.gain.value = trackState.eqMid;

  eqHighNode.type = 'highshelf';
  eqHighNode.frequency.value = EQ_HIGH_FREQ_HZ;
  eqHighNode.gain.value = trackState.eqHigh;

  reverbSendNode.gain.value = trackState.reverbSend;
  delaySendNode.gain.value = trackState.delaySend;

  source.buffer = buffer;
  source.loop = !oneShot;
  source.playbackRate.value = effectiveRate;
  gainNode.gain.value = trackState.volume;

  source.connect(eqLowNode);
  eqLowNode.connect(eqMidNode);
  eqMidNode.connect(eqHighNode);
  eqHighNode.connect(gainNode);
  gainNode.connect(masterGain);

  if (reverbInputGain) {
    gainNode.connect(reverbSendNode).connect(reverbInputGain);
  }

  if (delayInputGain) {
    gainNode.connect(delaySendNode).connect(delayInputGain);
  }

  return {
    source,
    gainNode,
    eqLowNode,
    eqMidNode,
    eqHighNode,
    reverbSendNode,
    delaySendNode,
    trackId,
    oneShot,
  };
};

/** Disconnects all nodes in a PlaybackHandle from the audio graph. */
export const disconnectHandle = (handle: PlaybackHandle): void => {
  handle.source.disconnect();
  handle.gainNode.disconnect();
  handle.eqLowNode.disconnect();
  handle.eqMidNode.disconnect();
  handle.eqHighNode.disconnect();
  handle.reverbSendNode.disconnect();
  handle.delaySendNode.disconnect();
};

/**
 * Sets up the reverb chain (convolver + wet gain) and returns the input gain node.
 */
export const buildReverbChain = (
  context: AudioContext,
  masterGain: GainNode,
  impulseBuffer: AudioBuffer,
  wetGain: number,
): GainNode => {
  const reverbInputGain = context.createGain();
  const reverbWetGain = context.createGain();
  const convolver = context.createConvolver();
  convolver.buffer = impulseBuffer;
  reverbInputGain.gain.value = 1;
  reverbWetGain.gain.value = wetGain;
  reverbInputGain.connect(convolver);
  convolver.connect(reverbWetGain).connect(masterGain);

  return reverbInputGain;
};

/**
 * Sets up the delay chain (delay node + filter + feedback + wet gain) and returns the input gain node.
 */
export const buildDelayChain = (
  context: AudioContext,
  masterGain: GainNode,
  delayTimeS: number,
  filterFreqHz: number,
  feedbackGain: number,
  wetGain: number,
  maxDelayS: number,
): GainNode => {
  const delayInputGain = context.createGain();
  const delayNode = context.createDelay(maxDelayS);
  const delayFilter = context.createBiquadFilter();
  const delayFeedbackGain = context.createGain();
  const delayWetGain = context.createGain();
  delayInputGain.gain.value = 1;
  delayNode.delayTime.value = delayTimeS;
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = filterFreqHz;
  delayFeedbackGain.gain.value = feedbackGain;
  delayWetGain.gain.value = wetGain;
  delayInputGain.connect(delayNode);
  delayNode.connect(delayFilter);
  delayFilter.connect(delayWetGain).connect(masterGain);
  delayFilter.connect(delayFeedbackGain).connect(delayNode);

  return delayInputGain;
};
