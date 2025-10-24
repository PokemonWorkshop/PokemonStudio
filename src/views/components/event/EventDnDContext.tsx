import type { StudioEventCommand } from '@root/src/models/entities/event/command';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type EventDnD = {
  type?: StudioEventCommand;
  setType: (type?: StudioEventCommand) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EventDnDContext = createContext<EventDnD>({ type: undefined, setType: (_?: StudioEventCommand) => undefined });

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<StudioEventCommand | undefined>(undefined);

  return <EventDnDContext.Provider value={{ type, setType }}>{children}</EventDnDContext.Provider>;
};

export const useEventDnD = () => {
  return useContext(EventDnDContext);
};
