import React, { createContext, ReactNode, useContext, useState } from 'react';

type EventDnD = {
  type?: string;
  setType: (type?: string) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EventDnDContext = createContext<EventDnD>({ type: undefined, setType: (_?: string) => undefined });

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<string | undefined>(undefined);

  return <EventDnDContext.Provider value={{ type, setType }}>{children}</EventDnDContext.Provider>;
};

export const useEventDnD = () => {
  return useContext(EventDnDContext);
};
