import React, { ReactNode } from 'react';
import { RouterPageStyle } from './RouterPageStyle';

export type PageWithMenuProps = {
  children: ReactNode;
  navigation: ReactNode;
};

export const PageWithMenu = ({ children, navigation }: PageWithMenuProps) => {
  return (
    <RouterPageStyle>
      {navigation}
      {children}
    </RouterPageStyle>
  );
};
