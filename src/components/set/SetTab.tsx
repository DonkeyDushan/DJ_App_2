import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box } from '@mui/material';

import { useMixer } from '../../state/MixerContext';
import { useSession } from '../../state/SessionContext';
import { MixLibrary } from './MixLibrary';
import { SessionEditor } from './SessionEditor';
import { TIMELINE_DROPPABLE_ID } from './SessionTimeline';
import { setTabRootSx } from './SetTab.styles';

export const SetTab = (): React.ReactElement => {
  const { snapshot, actions: mixerActions } = useMixer();
  const { activeSession, sessions, actions } = useSession();
  const [playheadSeconds, setPlayheadSeconds] = useState(0);
  const prevSessionIdRef = useRef(activeSession.id);

  useEffect(() => {
    if (prevSessionIdRef.current !== activeSession.id) {
      prevSessionIdRef.current = activeSession.id;
      setPlayheadSeconds(0);
    }
  }, [activeSession.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const type = active.data.current?.type as string | undefined;

    if (type === 'library-mix') {
      const mixId = active.data.current?.mixId as string;
      const overIsTimeline =
        over.id === TIMELINE_DROPPABLE_ID ||
        activeSession.slots.some((s) => s.id === over.id);
      if (overIsTimeline) actions.addSlot(mixId);
    } else if (type === 'slot') {
      if (active.id !== over.id) {
        const oldIdx = activeSession.slots.findIndex((s) => s.id === active.id);
        const newIdx = activeSession.slots.findIndex((s) => s.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          actions.reorderSlots(arrayMove(activeSession.slots, oldIdx, newIdx));
        }
      }
    }
  };

  const handlePlayPause = () => {
    if (snapshot.transportPlaying) {
      void mixerActions.toggleTransport();
      return;
    }
    const firstSlot = activeSession.slots[0];
    if (firstSlot) {
      void mixerActions.loadMixAndPlay(firstSlot.mixId);
    } else {
      void mixerActions.toggleTransport();
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={setTabRootSx}>
        <MixLibrary
          mixes={snapshot.savedMixes}
          onToggleFavorite={mixerActions.toggleMixFavorite}
          onAddToTimeline={actions.addSlot}
        />

        <SessionEditor
          activeSession={activeSession}
          sessions={sessions}
          mixes={snapshot.savedMixes}
          isPlaying={snapshot.transportPlaying}
          onPlayPause={handlePlayPause}
          onNewSession={actions.newSession}
          onSaveSession={actions.saveSession}
          onLoadSession={actions.loadSession}
          onDeleteSession={actions.deleteSession}
          onToggleSessionFavorite={actions.toggleSessionFavorite}
          onSetSessionName={actions.setSessionName}
          onRemoveSlot={actions.removeSlot}
          onDuplicateSlot={actions.duplicateSlot}
          onSetSlotDuration={actions.setSlotDuration}
          onSetTotalDuration={actions.setTotalDuration}
          onTimelineDragEnd={handleDragEnd}
          playheadSeconds={playheadSeconds}
          onSeek={setPlayheadSeconds}
        />
      </Box>
    </DndContext>
  );
};
