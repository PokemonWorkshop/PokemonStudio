import { useRef } from 'react';

export type DialogRefData<T extends string> = {
  openDialog: (name: T, isCenterDialog?: boolean) => void;
  closeDialog: () => void;
  currentDialog: T | undefined;
};

export const useDialogsRef = <T extends string>() => {
  return useRef<DialogRefData<T>>(null);
};
