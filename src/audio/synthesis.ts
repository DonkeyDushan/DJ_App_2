export function createImpulseResponse(context: AudioContext): AudioBuffer {
  const durationSeconds = 4.0;
  const preDelaySamples = Math.floor(0.018 * context.sampleRate);
  const buffer = context.createBuffer(
    2,
    Math.floor(durationSeconds * context.sampleRate),
    context.sampleRate,
  );
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let sampleIndex = preDelaySamples; sampleIndex < left.length; sampleIndex += 1) {
    const progress = (sampleIndex - preDelaySamples) / (left.length - preDelaySamples);
    const decay = Math.exp(-progress * 3.2);
    left[sampleIndex] = (Math.random() * 2 - 1) * decay;
    right[sampleIndex] = (Math.random() * 2 - 1) * decay;
  }

  return buffer;
}

function envelopeValue(
  positionSeconds: number,
  attack: number,
  decay: number,
): number {
  if (positionSeconds < 0 || positionSeconds > attack + decay) {
    return 0;
  }

  if (positionSeconds <= attack) {
    return positionSeconds / Math.max(attack, 0.0001);
  }

  return 1 - (positionSeconds - attack) / Math.max(decay, 0.0001);
}

function addSinePulse(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  frequency: number,
  volume: number,
  pan = 0,
  decay = 2.2,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(
    left.length,
    Math.floor((startTime + durationSeconds) * sampleRate),
  );

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env =
      volume *
      Math.exp(-time * decay) *
      envelopeValue(time, 0.01, durationSeconds);
    const wave = Math.sin(2 * Math.PI * frequency * time);
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += wave * env * leftGain;
    right[index] += wave * env * rightGain;
  }
}

function addSawPulse(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  frequency: number,
  volume: number,
  pan = 0,
  decay = 1.7,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(
    left.length,
    Math.floor((startTime + durationSeconds) * sampleRate),
  );

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env =
      volume *
      Math.exp(-time * decay) *
      envelopeValue(time, 0.005, durationSeconds);
    const phase = (time * frequency) % 1;
    const wave = phase * 2 - 1;
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += wave * env * leftGain;
    right[index] += wave * env * rightGain;
  }
}

function addNoiseBurst(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  volume: number,
  pan = 0,
  decay = 3.8,
): void {
  const startIndex = Math.max(0, Math.floor(startTime * sampleRate));
  const endIndex = Math.min(
    left.length,
    Math.floor((startTime + durationSeconds) * sampleRate),
  );

  for (let index = startIndex; index < endIndex; index += 1) {
    const time = index / sampleRate - startTime;
    const env =
      volume *
      Math.exp(-time * decay) *
      envelopeValue(time, 0.002, durationSeconds);
    const noise =
      Math.sin((index + 17) * 12.9898) * Math.cos((index + 33) * 78.233);
    const value = (noise % 1) * 2 - 1;
    const leftGain = 1 - Math.max(0, pan);
    const rightGain = 1 + Math.min(0, pan);
    left[index] += value * env * leftGain;
    right[index] += value * env * rightGain;
  }
}

function addChordPad(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
  startTime: number,
  durationSeconds: number,
  rootFrequency: number,
  volume: number,
): void {
  const chord = [1, 1.25, 1.5, 2].map(
    (multiplier) => rootFrequency * multiplier,
  );
  chord.forEach((frequency, chordIndex) => {
    addSinePulse(
      left,
      right,
      sampleRate,
      startTime,
      durationSeconds,
      frequency,
      volume * (chordIndex === 0 ? 0.35 : 0.18),
      chordIndex % 2 === 0 ? -0.12 : 0.12,
      0.7,
    );
  });
}

export function createDemoBuffer(
  context: AudioContext,
  trackId: string,
): AudioBuffer {
  const durationSeconds = 8;
  const { sampleRate } = context;
  const buffer = context.createBuffer(
    2,
    Math.floor(durationSeconds * sampleRate),
    sampleRate,
  );
  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const beat = 60 / 120;
  const step = beat / 2;

  if (trackId === 'drums') {
    for (let beatIndex = 0; beatIndex < 16; beatIndex += 1) {
      const time = beatIndex * beat;
      if (beatIndex % 4 === 0) {
        addSinePulse(left, right, sampleRate, time, 0.24, 56, 0.95, 0, 6);
      }
      if (beatIndex % 4 === 2) {
        addNoiseBurst(left, right, sampleRate, time + 0.02, 0.14, 0.65, 0, 7);
        addSinePulse(left, right, sampleRate, time, 0.18, 180, 0.26, 0, 8);
      }
    }

    for (let stepIndex = 0; stepIndex < 32; stepIndex += 1) {
      addNoiseBurst(
        left,
        right,
        sampleRate,
        stepIndex * step,
        0.035,
        0.16,
        0,
        12,
      );
    }

    return buffer;
  }

  if (trackId === 'bass') {
    const notes = [55, 55, 65.41, 49, 55, 73.42, 65.41, 49];
    notes.forEach((frequency, index) => {
      const time = index * beat * 2;
      addSawPulse(
        left,
        right,
        sampleRate,
        time,
        1.25,
        frequency,
        0.8,
        -0.08,
        2.2,
      );
      addSinePulse(
        left,
        right,
        sampleRate,
        time,
        0.45,
        frequency / 2,
        0.18,
        0.05,
        3.2,
      );
    });

    return buffer;
  }

  if (trackId === 'keys') {
    const chords = [
      [261.63, 329.63, 392.0],
      [293.66, 369.99, 440.0],
      [246.94, 311.13, 392.0],
      [196.0, 246.94, 293.66],
    ];

    chords.forEach((chord, chordIndex) => {
      const time = chordIndex * 2 * beat;
      chord.forEach((frequency, noteIndex) => {
        addSinePulse(
          left,
          right,
          sampleRate,
          time,
          1.9,
          frequency,
          0.22,
          noteIndex === 0 ? -0.1 : 0.1,
          0.9,
        );
      });
      addChordPad(left, right, sampleRate, time, 1.85, chord[0], 0.18);
    });

    return buffer;
  }

  if (trackId === 'arp') {
    const scale = [
      392.0, 493.88, 587.33, 493.88, 440.0, 523.25, 659.25, 523.25,
    ];
    scale.forEach((frequency, index) => {
      const time = index * beat;
      addSinePulse(
        left,
        right,
        sampleRate,
        time,
        0.28,
        frequency,
        0.4,
        index % 2 === 0 ? -0.12 : 0.12,
        4.5,
      );
      addSinePulse(
        left,
        right,
        sampleRate,
        time + 0.08,
        0.1,
        frequency * 2,
        0.16,
        0.05,
        7.5,
      );
    });

    return buffer;
  }

  const pads = [196.0, 174.61, 220.0, 146.83];
  pads.forEach((frequency, index) => {
    const time = index * 2 * beat;
    addChordPad(left, right, sampleRate, time, 2.4, frequency, 0.28);
    addSinePulse(
      left,
      right,
      sampleRate,
      time,
      2.4,
      frequency * 0.5,
      0.08,
      0.04,
      0.4,
    );
  });

  return buffer;
}
