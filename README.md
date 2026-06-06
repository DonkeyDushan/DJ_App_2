# Neon Mixer

A browser-based DJ mixer built with React, TypeScript, and the Web Audio API.

## Features

- **Multi-track looper** — enable/disable tracks across four categories: Drums, Arp, Pad, and Custom
- **Real-time EQ and effects** — per-track low/mid/high EQ shelves, reverb and delay sends
- **Live preview** — preview individual tracks without starting the transport
- **Global tempo** — scale playback rate across all tempo-locked tracks (0.5×–1.5×)
- **Presets** — save any track's settings as a named preset; edit or delete later
- **Custom sounds** — upload your own audio files and use them as loop tracks
- **Mix save/load** — persist the full mixer state (track selection, levels, tempo) as named mixes

## Tech stack

- **React 18** + TypeScript via Vite
- **Material UI v5** — dark neon theme, Orbitron font
- **Web Audio API** — synthesis, EQ (biquad filters), convolution reverb, delay with feedback
- **localStorage** — presets, favourites, saved mixes
- **IndexedDB via localforage** — custom sound blobs

## Project structure

```
src/
├── audio/
│   ├── audioEngine.ts     # AudioEngine class — playback, EQ, effects
│   └── synthesis.ts       # Demo buffer synthesis helpers
├── components/
│   ├── CustomSoundsDialog.tsx
│   ├── GlobalControls.tsx
│   ├── GlobalTempoPanel.tsx
│   ├── SaveLoadManager.tsx
│   ├── SliderRow.tsx      # Reusable labelled slider component
│   ├── TrackCard.tsx
│   ├── TrackEditModal.tsx
│   └── TrackGrid.tsx
├── data/
│   └── defaultTracks.ts   # Default track definitions
├── state/
│   ├── MixerContext.tsx   # React context + all mixer actions
│   └── mixerHelpers.ts    # Pure helper functions for state management
├── storage/
│   ├── customSounds.ts    # IndexedDB via localforage
│   ├── mixStorage.ts      # localStorage for mixes
│   └── trackPresets.ts    # localStorage for presets and favourites
├── strings.ts             # All user-visible UI strings
├── theme.ts               # MUI dark theme
└── types.ts               # TypeScript interfaces
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Editing UI text

All user-visible strings (button labels, tooltips, dialog titles, etc.) are centralised in [src/strings.ts](src/strings.ts), organised by component.
