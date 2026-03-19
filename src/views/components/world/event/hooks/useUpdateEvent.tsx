import { StudioEvent } from '@modelEntities/event/event';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectEvents } from '@hooks/useProjectData';
import { useCallback, useEffect, useRef } from 'react';

export const useUpdateEvent = (event: StudioEvent) => {
  const { setProjectDataValues: setEvent } = useProjectEvents();

  const eventRef = useRef(event);
  useEffect(() => {
    eventRef.current = event;
  }, [event]);

  return useCallback((updates: Partial<StudioEvent> | ((current: StudioEvent) => Partial<StudioEvent>)) => {
    const currentEvent = eventRef.current;
    const resolved = typeof updates === 'function' ? updates(currentEvent) : updates;
    const updatedEvent = {
      ...cloneEntity(currentEvent),
      ...resolved,
    };
    setEvent({ [currentEvent.dbSymbol]: updatedEvent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
