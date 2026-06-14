import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { loadSessions, persistSessions } from '../../core/storage/sessionStorage';
import type { DJSession, SessionSlot } from '../../core/types/sessionData';
import {
  DEFAULT_SLOT_DURATION_SECONDS,
  DEFAULT_TOTAL_DURATION_SECONDS,
  DEFAULT_TRANSITION_DURATION_SECONDS,
} from './constants/sessionDefaults';

const createBlankSession = (): DJSession => ({
  id: `draft-${Date.now()}`,
  name: '',
  createdAt: Date.now(),
  totalDurationSeconds: DEFAULT_TOTAL_DURATION_SECONDS,
  slots: [],
  isFavorite: false,
});

type SessionActions = {
  newSession: () => void;
  setSessionName: (name: string) => void;
  loadSession: (sessionId: string) => void;
  saveSession: () => void;
  resetSession: () => void;
  deleteSession: (sessionId: string) => void;
  toggleSessionFavorite: (sessionId: string) => void;
  addSlot: (mixId: string) => void;
  removeSlot: (slotId: string) => void;
  duplicateSlot: (slotId: string) => void;
  reorderSlots: (newSlots: SessionSlot[]) => void;
  setSlotDuration: (slotId: string, durationSeconds: number) => void;
  setSlotTransitionDuration: (slotId: string, transitionDuration: number) => void;
  setTotalDuration: (seconds: number) => void;
  startSetPlayback: () => void;
  stopSetPlayback: () => void;
  advanceSlot: () => void;
  seekToSlot: (slotIndex: number, offsetSeconds: number) => void;
};

type SessionContextValue = {
  sessions: DJSession[];
  activeSession: DJSession;
  setIsPlaying: boolean;
  currentSlotIndex: number | null;
  slotOffsetSeconds: number;
  playingMixId: string | null;
  hasUnsavedChanges: boolean;
  actions: SessionActions;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [sessions, setSessions] = useState<DJSession[]>([]);
  const [activeSession, setActiveSession] = useState<DJSession>(createBlankSession);
  const [setIsPlaying, setSetIsPlaying] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
  const [slotOffsetSeconds, setSlotOffsetSeconds] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sessionsRef = useRef(sessions);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  useEffect(() => {
    void loadSessions().then(setSessions);
  }, []);

  const playingMixId = useMemo(() => {
    if (currentSlotIndex === null) return null;

    return activeSession.slots[currentSlotIndex]?.mixId ?? null;
  }, [currentSlotIndex, activeSession.slots]);

  const actions = useMemo<SessionActions>(
    () => ({
      newSession: () => {
        setActiveSession(createBlankSession());
        setHasUnsavedChanges(false);
      },
      setSessionName: (name: string) => {
        setActiveSession((current) => ({ ...current, name }));
        setHasUnsavedChanges(true);
      },
      loadSession: (sessionId: string) => {
        setSessions((current) => {
          const session = current.find((s) => s.id === sessionId);
          if (session) setActiveSession({ ...session });

          return current;
        });
        setHasUnsavedChanges(false);
      },
      saveSession: () => {
        setActiveSession((current) => {
          const name = current.name.trim() || 'Untitled Set';
          const toSave: DJSession = { ...current, name };
          setSessions((prev) => {
            const exists = prev.some((s) => s.id === toSave.id);
            const next = exists
              ? prev.map((s) => (s.id === toSave.id ? toSave : s))
              : [toSave, ...prev];
            persistSessions(next);

            return next;
          });

          return toSave;
        });
        setHasUnsavedChanges(false);
      },
      resetSession: () => {
        setActiveSession((current) => {
          const savedVersion = sessionsRef.current.find((s) => s.id === current.id);

          return savedVersion ? { ...savedVersion } : createBlankSession();
        });
        setHasUnsavedChanges(false);
      },
      deleteSession: (sessionId: string) => {
        setSessions((prev) => {
          const next = prev.filter((s) => s.id !== sessionId);
          persistSessions(next);

          return next;
        });
      },
      toggleSessionFavorite: (sessionId: string) => {
        setSessions((prev) => {
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, isFavorite: !s.isFavorite } : s,
          );
          persistSessions(next);

          return next;
        });
      },
      addSlot: (mixId: string) => {
        const slot: SessionSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          mixId,
          durationSeconds: DEFAULT_SLOT_DURATION_SECONDS,
          transitionDuration: DEFAULT_TRANSITION_DURATION_SECONDS,
        };
        setActiveSession((current) => ({
          ...current,
          slots: [...current.slots, slot],
        }));
        setHasUnsavedChanges(true);
      },
      removeSlot: (slotId: string) => {
        setActiveSession((current) => ({
          ...current,
          slots: current.slots.filter((s) => s.id !== slotId),
        }));
        setHasUnsavedChanges(true);
      },
      duplicateSlot: (slotId: string) => {
        setActiveSession((current) => {
          const idx = current.slots.findIndex((s) => s.id === slotId);
          if (idx === -1) return current;
          const copy: SessionSlot = {
            ...current.slots[idx],
            id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          };
          const next = [...current.slots];
          next.splice(idx + 1, 0, copy);

          return { ...current, slots: next };
        });
        setHasUnsavedChanges(true);
      },
      reorderSlots: (newSlots: SessionSlot[]) => {
        setActiveSession((current) => ({ ...current, slots: newSlots }));
        setHasUnsavedChanges(true);
      },
      setSlotDuration: (slotId: string, durationSeconds: number) => {
        setActiveSession((current) => ({
          ...current,
          slots: current.slots.map((s) =>
            s.id === slotId ? { ...s, durationSeconds } : s,
          ),
        }));
        setHasUnsavedChanges(true);
      },
      setSlotTransitionDuration: (slotId: string, transitionDuration: number) => {
        setActiveSession((current) => ({
          ...current,
          slots: current.slots.map((s) =>
            s.id === slotId ? { ...s, transitionDuration } : s,
          ),
        }));
        setHasUnsavedChanges(true);
      },
      setTotalDuration: (totalDurationSeconds: number) => {
        setActiveSession((current) => ({ ...current, totalDurationSeconds }));
        setHasUnsavedChanges(true);
      },
      startSetPlayback: () => {
        setSetIsPlaying(true);
        setCurrentSlotIndex(0);
        setSlotOffsetSeconds(0);
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

  const value = useMemo<SessionContextValue>(
    () => ({ sessions, activeSession, setIsPlaying, currentSlotIndex, slotOffsetSeconds, playingMixId, hasUnsavedChanges, actions }),
    [sessions, activeSession, setIsPlaying, currentSlotIndex, slotOffsetSeconds, playingMixId, hasUnsavedChanges, actions],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be inside SessionProvider');

  return context;
};
