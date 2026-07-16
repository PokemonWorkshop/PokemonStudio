import { useCallback, useRef, useState } from 'react';
import type { MapEvent } from '../useMapEvents';

/**
 * Local editing state for the event dialog with full undo/redo history. Every
 * mutation flows through `commitDraft`, which snapshots the previous draft onto
 * the undo stack (capped) and clears the redo stack. `undo`/`redo` walk the
 * stacks; `canUndo`/`canRedo` drive the toolbar buttons.
 */

const HISTORY_LIMIT = 200;

export type EventDraft = {
  draft: MapEvent;
  commitDraft: (updater: MapEvent | ((prev: MapEvent) => MapEvent)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const useEventDraft = (event: MapEvent): EventDraft => {
  const [draft, setDraftRaw] = useState<MapEvent>(() => ({ ...event, pages: event.pages.map((p) => ({ ...p, list: [...p.list] })) }));
  const undoStack = useRef<MapEvent[]>([]);
  const redoStack = useRef<MapEvent[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const commitDraft = useCallback((updater: MapEvent | ((prev: MapEvent) => MapEvent)) => {
    setDraftRaw((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: MapEvent) => MapEvent)(prev) : updater;
      if (next === prev) return prev;
      undoStack.current.push(prev);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setCanUndo(true);
      setCanRedo(false);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setDraftRaw((prev) => {
      const past = undoStack.current.pop();
      if (past === undefined) return prev;
      redoStack.current.push(prev);
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      return past;
    });
  }, []);

  const redo = useCallback(() => {
    setDraftRaw((prev) => {
      const future = redoStack.current.pop();
      if (future === undefined) return prev;
      undoStack.current.push(prev);
      setCanRedo(redoStack.current.length > 0);
      setCanUndo(true);
      return future;
    });
  }, []);

  return { draft, commitDraft, undo, redo, canUndo, canRedo };
};
