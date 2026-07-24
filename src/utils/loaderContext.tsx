import { editorOverlayHidden } from '@components/editor/EditorOverlayV2';
import { playSound } from '@utils/sound';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

type LoaderTitle =
  | 'creating_project'
  | 'importing_project'
  | 'saving_project'
  | 'loading_project'
  | 'updating_psdk'
  | 'migrating_data'
  | 'importing_tiled_maps'
  | 'updating_maps';
type LoaderErrorTitle =
  | 'creating_project_error'
  | 'importing_project_error'
  | 'saving_project_error'
  | 'loading_project_error'
  | 'updating_psdk_error'
  | 'importing_tiled_maps_error'
  | 'assigning_tiled_maps_error'
  | 'updating_maps_error'
  | 'compilation_project_error';
type LoaderSuccessTitle = 'importing_tiled_maps_success' | 'assigning_tiled_maps_success' | 'update_maps';

type LoaderState = {
  thingInProgress: LoaderTitle;
  step: number;
  total: number;
  stepText: string;
  errorTitle?: LoaderErrorTitle;
  errorText: string;
  successTitle?: LoaderSuccessTitle;
  successText: string;
  isOpen: boolean;
  isLogsAvailable: boolean;
  dynamicAction?: React.ReactNode;
};

export type LoaderContext = LoaderState & {
  close: () => void;
  open: (thingInProgress: LoaderTitle, step: number, total: number, stepText: string) => void;
  setProgress: (step: number, total: number, stepText: string) => void;
  setError: (errorTitle: LoaderErrorTitle, errorText: string, isLogsAvailable?: boolean, dynamicAction?: React.ReactNode) => void;
  setSuccess: (successTitle: LoaderSuccessTitle, successText: string) => void;
};

const LoaderContextHolder = createContext<LoaderContext>({
  thingInProgress: 'creating_project',
  step: 0,
  total: 0,
  stepText: '',
  errorTitle: undefined,
  errorText: '',
  successTitle: undefined,
  successText: '',
  isOpen: false,
  isLogsAvailable: false,
  dynamicAction: undefined,
  close: () => null,
  open: (_thingInProgress: LoaderTitle, _step: number, _total: number, _stepText: string) => null,
  setProgress: (_step: number, _total: number, _stepText: string) => null,
  setError: (_errorTitle: LoaderErrorTitle, _errorText: string, _isLogsAvailable?: boolean) => null,
  setSuccess: (_successTitle: LoaderSuccessTitle, _successText: string) => null,
});

export const useLoaderContext = () => useContext(LoaderContextHolder);

// Hook to use when you execute function that takes time and needs to have the most updated version of the loader context
export const useLoaderRef = () => {
  const loaderContext = useLoaderContext();
  const loaderContextRef = useRef(loaderContext);

  useEffect(() => {
    loaderContextRef.current = loaderContext;
  }, [loaderContext]);

  return loaderContextRef;
};

const useLoaderContextService = (): LoaderContext => {
  const [loaderState, setLoaderState] = useState<LoaderState>({
    thingInProgress: 'creating_project',
    step: 0,
    total: 0,
    stepText: '',
    errorTitle: undefined,
    errorText: '',
    successTitle: undefined,
    successText: '',
    isOpen: false,
    isLogsAvailable: false,
    dynamicAction: undefined,
  });

  return {
    ...loaderState,
    close: () => {
      setLoaderState({ ...loaderState, isOpen: false });
      editorOverlayHidden(false);
    },
    open: (thingInProgress: LoaderTitle, step: number, total: number, stepText: string) => {
      // Loading a project is a multi-second operation the user often walks away
      // from — mark its START so they know it's underway. Other loader openings
      // (saving, importing) get their cue on completion instead.
      if (thingInProgress === 'loading_project') playSound('loading');
      setLoaderState({
        ...loaderState,
        thingInProgress,
        step,
        total,
        stepText,
        errorTitle: undefined,
        errorText: '',
        successTitle: undefined,
        successText: '',
        isOpen: true,
      });
      editorOverlayHidden(true);
    },
    setProgress: (step: number, total: number, stepText: string) =>
      setLoaderState({
        ...loaderState,
        step,
        total,
        stepText,
      }),
    setError: (errorTitle: LoaderErrorTitle, errorText: string, isLogsAvailable?: boolean, dynamicAction?: React.ReactNode) => {
      // The one cue that must never be the ONLY signal — it always accompanies
      // this visible error dialog, never replaces it.
      playSound('error');
      setLoaderState({
        ...loaderState,
        errorTitle,
        errorText,
        dynamicAction,
        isLogsAvailable: isLogsAvailable || false,
        isOpen: true,
      });
    },
    setSuccess: (successTitle: LoaderSuccessTitle, successText: string) => {
      // A finished import/update — occasional, and otherwise only announced by
      // this dialog quietly appearing.
      playSound('success');
      setLoaderState({
        ...loaderState,
        successTitle,
        successText,
        isOpen: true,
      });
    },
  };
};

export const LoaderContextProvider = ({ children }: { children: ReactNode }) => {
  const loaderContext = useLoaderContextService();
  return <LoaderContextHolder.Provider value={loaderContext}>{children}</LoaderContextHolder.Provider>;
};
