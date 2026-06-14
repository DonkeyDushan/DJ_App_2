/**
 * Core data types for DJ sessions (set planning / timeline).
 * Used by the Session feature.
 */

export interface SessionSlot {
  id: string;
  mixId: string;
  durationSeconds: number;
  transitionDuration: number;
}

export interface DJSession {
  id: string;
  name: string;
  createdAt: number;
  totalDurationSeconds: number;
  slots: SessionSlot[];
  isFavorite: boolean;
}
