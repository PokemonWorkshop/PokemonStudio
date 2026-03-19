import { StudioEvent } from '@modelEntities/event/event';
import type { StudioEventCommandType } from '@root/src/models/entities/event/command';
import { useUpdateEvent } from '@src/poc/eventEditor/useUpdateEvent';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type EventActionsContextType = {
  setType: (type?: StudioEventCommandType) => void;
  setCurrentEditedNode: (currentEditedNode?: string) => void;
  updateEvent: (updates: Partial<StudioEvent> | ((current: StudioEvent) => Partial<StudioEvent>)) => void;
};

type EventDataContextType = {
  type?: StudioEventCommandType;
  currentEditedNode?: string;
  event?: StudioEvent;
};

const EventActionsContext = createContext<EventActionsContextType>({
  setCurrentEditedNode: () => undefined,
  setType: () => undefined,
  updateEvent: () => undefined,
});

const EventDataContext = createContext<EventDataContextType>({
  type: undefined,
  currentEditedNode: undefined,
  event: undefined,
});

type EventProvidedProps = {
  event: StudioEvent;
  children: ReactNode;
};

export const EventProvider = ({ event, children }: EventProvidedProps) => {
  const [type, setType] = useState<StudioEventCommandType | undefined>(undefined);
  const [currentEditedNode, setCurrentEditedNode] = useState<string | undefined>(undefined);
  const updateEvent = useUpdateEvent(event);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actions = useMemo(() => ({ setType, setCurrentEditedNode, updateEvent }), []);

  return (
    <EventActionsContext.Provider value={actions}>
      <EventDataContext.Provider value={{ type, currentEditedNode, event }}>{children}</EventDataContext.Provider>
    </EventActionsContext.Provider>
  );
};

export const useEventActions = () => useContext(EventActionsContext);
export const useEventData = () => useContext(EventDataContext);

export const useEventContext = () => {
  return { ...useEventActions(), ...useEventData() };
};
