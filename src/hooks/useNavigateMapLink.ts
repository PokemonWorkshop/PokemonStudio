import { useNavigate } from 'react-router';
import { useProjectMapLinks, useProjectMaps } from './useProjectData';
import type { StudioMap } from '@modelEntities/map';
import { useMemo } from 'react';

export const useNavigateMapLink = () => {
  const { projectDataValues: mapLinks, setSelectedDataIdentifier: setSelectedMapLink } = useProjectMapLinks();
  const { setSelectedDataIdentifier: setSelectedMap } = useProjectMaps();
  const navigate = useNavigate();
  const mapLinkValues = useMemo(() => Object.values(mapLinks), [mapLinks]);

  const navigateMapLink = (map: StudioMap) => {
    if (!map) return;

    const mapLink = mapLinkValues.find(({ mapId }) => mapId === map.id);
    if (!mapLink) return;

    setSelectedMapLink({ mapLink: mapLink.dbSymbol });
    setSelectedMap({ map: map.dbSymbol });
    setTimeout(() => navigate('/world/maplink2'), 50);
  };

  return navigateMapLink;
};
