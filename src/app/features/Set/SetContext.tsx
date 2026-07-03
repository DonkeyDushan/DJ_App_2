import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { loadSets, persistSets } from '../../core/storage/setStorage';
import type { DJSet, SetSlot } from '../../core/types/setData';
import type { TransitionKind } from '../../core/types/transition';
import {
  DEFAULT_SLOT_DURATION_SECONDS,
  DEFAULT_TOTAL_DURATION_SECONDS,
  DEFAULT_TRANSITION_DURATION_SECONDS,
  DEFAULT_TRANSITION_KIND,
} from './constants/setDefaults';
import { normalizeSet } from './utils/normalizeSet';

const createBlankSet = (): DJSet => ({
  id: `draft-${Date.now()}`,
  name: '',
  createdAt: Date.now(),
  totalDurationSeconds: DEFAULT_TOTAL_DURATION_SECONDS,
  slots: [],
  isFavorite: false,
  defaultTransitionKind: DEFAULT_TRANSITION_KIND,
  defaultTransitionDuration: DEFAULT_TRANSITION_DURATION_SECONDS,
});

type SetActions = {
  newSet: () => void;
  updateSetName: (name: string) => void;
  loadSet: (setId: string) => void;
  saveSet: () => void;
  resetSet: () => void;
  deleteSet: (setId: string) => void;
  renameSet: (setId: string, name: string) => void;
  toggleSetFavorite: (setId: string) => void;
  addSlot: (mixId: string) => void;
  removeSlot: (slotId: string) => void;
  duplicateSlot: (slotId: string) => void;
  reorderSlots: (newSlots: SetSlot[]) => void;
  setSlotDuration: (slotId: string, durationSeconds: number) => void;
  setSlotTransitionDuration: (slotId: string, transitionDuration: number) => void;
  setSlotTransitionKind: (slotId: string, transitionKind: TransitionKind) => void;
  updateSetDefaultTransition: (
    transitionKind: TransitionKind,
    transitionDuration: number,
  ) => void;
  setTotalDuration: (seconds: number) => void;
  startSetPlayback: () => void;
  pauseSetPlayback: () => void;
  resumeSetPlayback: () => void;
  stopSetPlayback: () => void;
  advanceSlot: () => void;
  seekToSlot: (slotIndex: number, offsetSeconds: number) => void;
};

type SetContextValue = {
  sets: DJSet[];
  activeSet: DJSet;
  setIsPlaying: boolean;
  currentSlotIndex: number | null;
  slotOffsetSeconds: number;
  playingMixId: string | null;
  hasUnsavedChanges: boolean;
  actions: SetActions;
};

const SetContext = createContext<SetContextValue | null>(null);

export const SetProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [sets, setSets] = useState<DJSet[]>([]);
  const [activeSet, setActiveSet] = useState<DJSet>(createBlankSet);
  const [setIsPlaying, setSetIsPlaying] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
  const [slotOffsetSeconds, setSlotOffsetSeconds] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const setsRef = useRef(sets);
  useEffect(() => { setsRef.current = sets; }, [sets]);

  // Refs read by the stable (empty-dep) action callbacks below, so loading a
  // set can branch on the live playback state and current selection without
  // recreating the actions object.
  const isPlayingRef = useRef(setIsPlaying);
  useEffect(() => { isPlayingRef.current = setIsPlaying; }, [setIsPlaying]);
  const activeSetIdRef = useRef(activeSet.id);
  useEffect(() => { activeSetIdRef.current = activeSet.id; }, [activeSet.id]);

  useEffect(() => {
    void loadSets().then((loaded) => setSets(loaded.map(normalizeSet)));
  }, []);

  const playingMixId = useMemo(() => {
    if (currentSlotIndex === null) return null;

    return activeSet.slots[currentSlotIndex]?.mixId ?? null;
  }, [currentSlotIndex, activeSet.slots]);

  const actions = useMemo<SetActions>(
    () => ({
      newSet: () => {
        setActiveSet(createBlankSet());
        setHasUnsavedChanges(false);
      },
      updateSetName: (name: string) => {
        setActiveSet((current) => ({ ...current, name }));
        setHasUnsavedChanges(true);
      },
      loadSet: (setId: string) => {
        const set = setsRef.current.find((s) => s.id === setId);
        if (!set) return;

        const isDifferentSet = activeSetIdRef.current !== set.id;

        setActiveSet({ ...set });
        setHasUnsavedChanges(false);

        // A newly selected set always begins from its start. While playing,
        // restart the transport on its first slot so the previous set stops and
        // the new one begins (see useSetPlayback). While paused or stopped,
        // clear the playhead so the next play starts fresh from 0 rather than
        // resuming a leftover slot from the previous set.
        if (isDifferentSet) {
          setSlotOffsetSeconds(0);
          setCurrentSlotIndex(isPlayingRef.current ? 0 : null);
        }
      },
      saveSet: () => {
        setActiveSet((current) => {
          const name = current.name.trim() || 'Untitled Set';
          const toSave: DJSet = { ...current, name };
          setSets((prev) => {
            const exists = prev.some((s) => s.id === toSave.id);
            const next = exists
              ? prev.map((s) => (s.id === toSave.id ? toSave : s))
              : [toSave, ...prev];
            persistSets(next);

            return next;
          });

          return toSave;
        });
        setHasUnsavedChanges(false);
      },
      resetSet: () => {
        setActiveSet((current) => {
          const savedVersion = setsRef.current.find((s) => s.id === current.id);

          return savedVersion ? { ...savedVersion } : createBlankSet();
        });
        setHasUnsavedChanges(false);
      },
      deleteSet: (setId: string) => {
        setSets((prev) => {
          const next = prev.filter((s) => s.id !== setId);
          persistSets(next);

          return next;
        });
      },
      renameSet: (setId: string, name: string) => {
        setSets((prev) => {
          const next = prev.map((s) => (s.id === setId ? { ...s, name } : s));
          persistSets(next);

          return next;
        });
        setActiveSet((current) =>
          current.id === setId ? { ...current, name } : current,
        );
      },
      toggleSetFavorite: (setId: string) => {
        setSets((prev) => {
          const next = prev.map((s) =>
            s.id === setId ? { ...s, isFavorite: !s.isFavorite } : s,
          );
          persistSets(next);

          return next;
        });
      },
      addSlot: (mixId: string) => {
        setActiveSet((current) => {
          const slot: SetSlot = {
            id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            mixId,
            durationSeconds: DEFAULT_SLOT_DURATION_SECONDS,
            transitionKind: current.defaultTransitionKind,
            transitionDuration: current.defaultTransitionDuration,
          };

          return { ...current, slots: [...current.slots, slot] };
        });
        setHasUnsavedChanges(true);
      },
      removeSlot: (slotId: string) => {
        setActiveSet((current) => ({
          ...current,
          slots: current.slots.filter((s) => s.id !== slotId),
        }));
        setHasUnsavedChanges(true);
      },
      duplicateSlot: (slotId: string) => {
        setActiveSet((current) => {
          const idx = current.slots.findIndex((s) => s.id === slotId);
          if (idx === -1) return current;
          const copy: SetSlot = {
            ...current.slots[idx],
            id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          };
          const next = [...current.slots];
          next.splice(idx + 1, 0, copy);

          return { ...current, slots: next };
        });
        setHasUnsavedChanges(true);
      },
      reorderSlots: (newSlots: SetSlot[]) => {
        setActiveSet((current) => ({ ...current, slots: newSlots }));
        setHasUnsavedChanges(true);
      },
      setSlotDuration: (slotId: string, durationSeconds: number) => {
        setActiveSet((current) => ({
          ...current,
          slots: current.slots.map((s) =>
            s.id === slotId ? { ...s, durationSeconds } : s,
          ),
        }));
        setHasUnsavedChanges(true);
      },
      setSlotTransitionDuration: (slotId: string, transitionDuration: number) => {
        setActiveSet((current) => ({
          ...current,
          slots: current.slots.map((s) =>
            s.id === slotId ? { ...s, transitionDuration } : s,
          ),
        }));
        setHasUnsavedChanges(true);
      },
      setSlotTransitionKind: (slotId: string, transitionKind: TransitionKind) => {
        setActiveSet((current) => ({
          ...current,
          slots: current.slots.map((s) =>
            s.id === slotId ? { ...s, transitionKind } : s,
          ),
        }));
        setHasUnsavedChanges(true);
      },
      updateSetDefaultTransition: (
        transitionKind: TransitionKind,
        transitionDuration: number,
      ) => {
        setActiveSet((current) => ({
          ...current,
          defaultTransitionKind: transitionKind,
          defaultTransitionDuration: transitionDuration,
        }));
        setHasUnsavedChanges(true);
      },
      setTotalDuration: (totalDurationSeconds: number) => {
        setActiveSet((current) => ({ ...current, totalDurationSeconds }));
        setHasUnsavedChanges(true);
      },
      startSetPlayback: () => {
        setSetIsPlaying(true);
        setCurrentSlotIndex(0);
        setSlotOffsetSeconds(0);
      },
      // Pause keeps currentSlotIndex/slotOffsetSeconds intact so playback can
      // resume from the same position. The accurate in-slot offset is recorded
      // separately by the timeline's seek callback as playback stops.
      pauseSetPlayback: () => {
        setSetIsPlaying(false);
      },
      // Resume continues from the preserved position (set true only — the slot
      // index and offset are left untouched from where playback was paused).
      resumeSetPlayback: () => {
        setSetIsPlaying(true);
      },
      stopSetPlayback: () => {
        setSetIsPlaying(false);
        setCurrentSlotIndex(null);
        setSlotOffsetSeconds(0);
      },
      advanceSlot: () => {
        setSlotOffsetSeconds(0);
        setCurrentSlotIndex((prev) => (prev !== null ? prev + 1 : null));
      },
      seekToSlot: (slotIndex: number, offsetSeconds: number) => {
        setCurrentSlotIndex(slotIndex);
        setSlotOffsetSeconds(offsetSeconds);
      },
    }),
    [],
  );

  const value = useMemo<SetContextValue>(
    () => ({ sets, activeSet, setIsPlaying, currentSlotIndex, slotOffsetSeconds, playingMixId, hasUnsavedChanges, actions }),
    [sets, activeSet, setIsPlaying, currentSlotIndex, slotOffsetSeconds, playingMixId, hasUnsavedChanges, actions],
  );

  return (
    <SetContext.Provider value={value}>{children}</SetContext.Provider>
  );
};

export const useSet = (): SetContextValue => {
  const context = useContext(SetContext);
  if (!context) throw new Error('useSet must be inside SetProvider');

  return context;
};
