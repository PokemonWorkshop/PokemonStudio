import { useCallback, useEffect, useState } from 'react';
import type { WorkingCommand } from './rmxpEventUtils';
import type { RMXPEventCommand } from '@src/backendTasks/readRMXPEvents';
import type { EditedCommand } from '@src/backendTasks/writeRMXPEvents';

/**
 * Load/save the project's common events (Data/CommonEvents.rxdata) with the same
 * keep-protocol as useMapEvents: each command loaded from disk is stamped with a
 * `__keep` index so an untouched command is carried over byte-faithfully on save
 * (preserving rich params — audio/tone/move-routes), and only edited/new commands
 * are rebuilt from plain JSON.
 *
 * A common event is much simpler than a map event: a name, a trigger
 * (0 none / 1 autorun / 2 parallel), a switch, and one command list. No pages,
 * graphic, conditions, or move route at the event level.
 */

export type WorkingCommonEvent = {
  id: number;
  name: string;
  trigger: number;
  switchId: number;
  list: (WorkingCommand & { __keep?: number })[];
  /** Provenance for the keep-protocol (see save()). Absent on a brand-new event. */
  __source?: { id: number; listLength: number; listIndents: number[] };
};

const nextId = (events: WorkingCommonEvent[]): number => events.reduce((m, e) => Math.max(m, e.id), 0) + 1;

/** A fresh common event: empty command list (just the code-0 terminator). */
const createEmpty = (id: number): WorkingCommonEvent => ({
  id,
  name: '',
  trigger: 0,
  switchId: 1,
  list: [{ code: 0, indent: 0, parameters: [] }],
});

export const useCommonEvents = (projectPath: string | null) => {
  const [commonEvents, setCommonEvents] = useState<WorkingCommonEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [skipped, setSkipped] = useState(0);

  const reload = useCallback(() => {
    if (!projectPath) return;
    setLoading(true);
    window.api.readRMXPCommonEvents(
      { projectPath },
      ({ commonEvents: read, skipped: skippedOnRead }) => {
        setCommonEvents(
          read.map((ce) => ({
            id: ce.id,
            name: ce.name,
            trigger: ce.trigger,
            switchId: ce.switchId,
            __source: { id: ce.id, listLength: ce.list.length, listIndents: ce.list.map((c: RMXPEventCommand) => c.indent) },
            // Stamp __keep so untouched commands round-trip byte-faithfully.
            list: ce.list.map((c: RMXPEventCommand, i: number) => ({ ...(c as WorkingCommand), __keep: i })),
          })),
        );
        setSkipped(skippedOnRead);
        setError(null);
        setDirty(false);
        setLoading(false);
      },
      ({ errorMessage }) => {
        setCommonEvents([]);
        setSkipped(0);
        setError(errorMessage);
        setDirty(false);
        setLoading(false);
      },
    );
  }, [projectPath]);

  useEffect(() => reload(), [reload]);

  const save = useCallback((): Promise<string | null> => {
    if (!projectPath) return Promise.resolve('No project loaded');
    if (skipped > 0) {
      return Promise.resolve(`${skipped} common event(s) could not be read, so saving would delete them. Fix them in RMXP first.`);
    }
    const payload = commonEvents.map((ce) => {
      const source = ce.__source;
      // A list still in its original order + length + indents is carried
      // byte-faithfully by the backend — only ship an edit protocol when it changed.
      const untouched =
        !!source &&
        ce.list.length === source.listLength &&
        ce.list.every((cmd, i) => cmd.__keep === i && cmd.indent === source.listIndents[i]);
      return {
        id: ce.id,
        name: ce.name,
        trigger: ce.trigger,
        switchId: ce.switchId,
        ...(source ? { __source: { id: source.id } } : {}),
        ...(untouched
          ? {}
          : {
              editedList: ce.list.map((cmd): EditedCommand =>
                cmd.__keep !== undefined
                  ? { keep: cmd.__keep, indent: cmd.indent }
                  : { code: cmd.code, indent: cmd.indent, parameters: cmd.parameters },
              ),
            }),
      };
    });
    return new Promise((resolve) => {
      window.api.writeRMXPCommonEvents(
        { projectPath, commonEvents: payload, skippedOnRead: skipped },
        () => {
          setDirty(false);
          reload();
          resolve(null);
        },
        ({ errorMessage }) => resolve(errorMessage),
      );
    });
  }, [projectPath, commonEvents, skipped, reload]);

  const updateEvent = useCallback((id: number, patch: Partial<Pick<WorkingCommonEvent, 'name' | 'trigger' | 'switchId'>>) => {
    setCommonEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setDirty(true);
  }, []);

  const setList = useCallback((id: number, list: WorkingCommonEvent['list']) => {
    setCommonEvents((prev) => prev.map((e) => (e.id === id ? { ...e, list } : e)));
    setDirty(true);
  }, []);

  const createEvent = useCallback((): number => {
    let created = 0;
    setCommonEvents((prev) => {
      created = nextId(prev);
      return [...prev, createEmpty(created)];
    });
    setDirty(true);
    return created;
  }, []);

  const deleteEvent = useCallback((id: number) => {
    setCommonEvents((prev) => prev.filter((e) => e.id !== id));
    setDirty(true);
  }, []);

  return { commonEvents, loading, error, dirty, skipped, reload, save, updateEvent, setList, createEvent, deleteEvent };
};
