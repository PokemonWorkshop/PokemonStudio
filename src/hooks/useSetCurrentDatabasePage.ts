import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSetCurrentDatabasePath = () => {
  const { pathname } = useLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => sessionStorage.setItem('lastDatabasePage', pathname), []);
};
