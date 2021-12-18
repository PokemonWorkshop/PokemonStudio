import { useState } from 'react';

/**
 * Hook used by <Editor /> elements to mutate the item without having to refresh everything
 *
 * @caution Do not use this hook if you did not explicitely deep cloned the object involved in this use of useRefreshUI !
 */
export const useRefreshUI = () => {
  const [state, setState] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_: unknown) => setState(!state);
};
