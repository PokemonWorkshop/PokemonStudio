import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { NavigationDatabaseStyle } from '@components/database/navigation/NavigationDatabase/NavigationDatabaseStyle';
import { NavigationDatabaseItem } from '@components/database/navigation/NavigationDatabaseItem';
import { findMenuByPath, getDefaultMenu } from './menuConfig';

const WorldNavigationStyle = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 2px;
  min-width: 320px;
`;

const WorlMapsEventDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  padding-bottom: 8px;
`;

const WorldBuildingNavigationStyle = styled(NavigationDatabaseStyle)`
  padding-bottom: 16px;
  gap: 16px;
`;

// Hook personnalisé pour gérer la navigation conditionnelle
const useConditionalMenu = () => {
  const location = useLocation();

  const getCurrentMenu = () => {
    const menuConfig = findMenuByPath(location.pathname);
    return menuConfig || getDefaultMenu();
  };

  return {
    currentMenu: getCurrentMenu(),
    pathname: location.pathname
  };
};

export const WorldNavigationAdvanced = () => {
  const { t } = useTranslation();
  const { currentMenu } = useConditionalMenu();

  // Récupération de tous les menus pour la navigation
  const navigationItems = [
    { path: '/world/map', label: t('maps') },
    { path: '/world/events', label: t('events') },
    { path: '/world/maplinks', label: t('maplinks') }
  ];

  return (
    <WorldNavigationStyle>
      <WorldBuildingNavigationStyle>
        <WorlMapsEventDiv>
          {navigationItems.map((item) => (
            <NavigationDatabaseItem
              key={item.path}
              path={item.path}
              label={item.label}
            />
          ))}
        </WorlMapsEventDiv>
      </WorldBuildingNavigationStyle>

      {/* Rendu conditionnel du menu basé sur le path */}
      <currentMenu.component />
    </WorldNavigationStyle>
  );
};
