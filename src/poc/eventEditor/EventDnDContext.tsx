import React, { createContext, ReactNode, useContext, useState } from 'react';

type EventDnD = {
  type?: string;
  setType: (type?: string) => void;
};
const EventDnDContext = createContext<EventDnD>({ type: undefined, setType: (_?: string) => {} });

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<string | undefined>(undefined);

  return <EventDnDContext.Provider value={{ type, setType }}>{children}</EventDnDContext.Provider>;
};

export const useEventDnD = () => {
  return useContext(EventDnDContext);
};
