import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

type UnsavedWarningContextType = {
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
  setOnConfirmQuit: (cb: () => Promise<void>) => void;
  onConfirmQuit: () => Promise<void>;
};

const UnsavedWarningContext = createContext<UnsavedWarningContextType | undefined>(undefined);

export const UnsavedWarningProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const onConfirmQuitRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const setOnConfirmQuit = (cb: () => Promise<void>) => {
    onConfirmQuitRef.current = cb;
  };

  const onConfirmQuit = async () => {
    closeModal();
    await onConfirmQuitRef.current();
  };

  return (
    <UnsavedWarningContext.Provider value={{ showModal, openModal, closeModal, setOnConfirmQuit, onConfirmQuit }}>
      {children}
    </UnsavedWarningContext.Provider>
  );
};

export const useUnsavedWarning = () => {
  const context = useContext(UnsavedWarningContext);
  if (!context) {
    throw new Error('useUnsavedWarning must be used within UnsavedWarningProvider');
  }
  return context;
};
