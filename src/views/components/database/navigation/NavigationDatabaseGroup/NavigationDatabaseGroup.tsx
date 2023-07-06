import React, { ReactNode } from 'react';
import { NavigationDatabaseGroupStyle } from './NavigationDatabaseGroupStyle';

interface NavigationDatabaseGroupProps {
  title: string;
  children: ReactNode;
}

export const NavigationDatabaseGroup = ({ title, children }: NavigationDatabaseGroupProps) => {
  return (
    <NavigationDatabaseGroupStyle>
      <span className="title">{title}</span>
      {children}
    </NavigationDatabaseGroupStyle>
  );
};
