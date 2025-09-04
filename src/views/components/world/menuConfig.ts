import { ComponentType } from 'react';
import { MapMenu } from './map';

// Interface pour définir la structure d'un menu
export interface MenuConfig {
  path: string;
  component: ComponentType;
  label: string;
}

// Configuration des menus disponibles
export const menuConfigs: MenuConfig[] = [
  {
    path: '/world/map',
    component: MapMenu,
    label: 'maps'
  },
  {
    path: '/world/events',
    component: () => (
      <div>
        <h3>Menu des événements</h3>
        <p>Contenu du menu des événements</p>
      </div>
    ),
    label: 'events'
  },
  {
    path: '/world/maplinks',
    component: () => (
      <div>
        <h3>Menu des maplinks</h3>
        <p>Contenu du menu des maplinks</p>
      </div>
    ),
    label: 'maplinks'
  }
];

// Fonction utilitaire pour trouver le menu correspondant au path
export const findMenuByPath = (pathname: string): MenuConfig | undefined => {
  return menuConfigs.find(config => pathname.startsWith(config.path));
};

// Fonction pour obtenir le composant de menu par défaut
export const getDefaultMenu = (): MenuConfig => {
  return menuConfigs[0]; // Retourne le premier menu (MapMenu) par défaut
};
