import { StudioEvent } from '@modelEntities/event/event';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectEvents } from '@hooks/useProjectData';
import { useCallback } from 'react';

export const useUpdateEvent = (event: StudioEvent) => {
  const { setProjectDataValues: setEvent } = useProjectEvents();

  return useCallback(
    (updates: Partial<StudioEvent>) => {
      const updatedEvent = {
        ...cloneEntity(event),
        ...updates,
      };
      setEvent({ [event.dbSymbol]: updatedEvent });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event]
  );
};
