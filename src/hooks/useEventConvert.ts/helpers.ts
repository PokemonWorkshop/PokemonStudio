import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { EventConvertFunctionBinding, EventConvertStateObject } from './types';

export const handleFailure =
  (setState: Dispatch<SetStateAction<EventConvertStateObject>>, binding: RefObject<EventConvertFunctionBinding>) =>
  ({ errorMessage }: { errorMessage: string }) => {
    setState({ state: 'done' });
    window.api.log.error('Failed to convert the event(s)', errorMessage);
    binding.current.onFailure(errorMessage);
  };
