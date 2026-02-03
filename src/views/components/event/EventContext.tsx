import type { StudioEventCommand } from '@root/src/models/entities/event/command';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type EventContextType = {
  type?: StudioEventCommand;
  currentEditedNode?: string;
  setType: (type?: StudioEventCommand) => void;
  setCurrentEditedNode: (currentEditedNode?: string) => void;
};

const EventContext = createContext<EventContextType>({
  type: undefined,
  currentEditedNode: undefined,
  setCurrentEditedNode: (_?: string) => undefined,
  setType: (_?: string) => undefined,
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<StudioEventCommand | undefined>(undefined);
  const [currentEditedNode, setCurrentEditedNode] = useState<string | undefined>(undefined);

  return <EventContext.Provider value={{ type, currentEditedNode, setType, setCurrentEditedNode }}>{children}</EventContext.Provider>;
};

export const useEventContext = () => {
  return useContext(EventContext);
};
