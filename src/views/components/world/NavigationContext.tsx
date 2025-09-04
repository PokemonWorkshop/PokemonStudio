import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Types pour la navigation
export interface NavigationState {
  activeMenu: string;
  menuHistory: string[];
  customMenuData?: Record<string, any>;
}

export interface NavigationContextType {
  navigationState: NavigationState;
  setActiveMenu: (menu: string) => void;
  pushToHistory: (menu: string) => void;
  popFromHistory: () => string | null;
  setCustomMenuData: (data: Record<string, any>) => void;
  clearHistory: () => void;
}

// Création du contexte
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider du contexte
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeMenu: location.pathname,
    menuHistory: [location.pathname],
    customMenuData: {}
  });

  const setActiveMenu = useCallback((menu: string) => {
    setNavigationState(prev => ({
      ...prev,
      activeMenu: menu
    }));
  }, []);

  const pushToHistory = useCallback((menu: string) => {
    setNavigationState(prev => ({
      ...prev,
      menuHistory: [...prev.menuHistory, menu],
      activeMenu: menu
    }));
  }, []);

  const popFromHistory = useCallback(() => {
    setNavigationState(prev => {
      if (prev.menuHistory.length <= 1) return prev;

      const newHistory = [...prev.menuHistory];
      newHistory.pop();
      const previousMenu = newHistory[newHistory.length - 1];

      return {
        ...prev,
        menuHistory: newHistory,
        activeMenu: previousMenu
      };
    });

    return navigationState.menuHistory[navigationState.menuHistory.length - 2] || null;
  }, [navigationState.menuHistory]);

  const setCustomMenuData = useCallback((data: Record<string, any>) => {
    setNavigationState(prev => ({
      ...prev,
      customMenuData: { ...prev.customMenuData, ...data }
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      menuHistory: [prev.activeMenu]
    }));
  }, []);

  const value: NavigationContextType = {
    navigationState,
    setActiveMenu,
    pushToHistory,
    popFromHistory,
    setCustomMenuData,
    clearHistory
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook pour utiliser le contexte de navigation
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
