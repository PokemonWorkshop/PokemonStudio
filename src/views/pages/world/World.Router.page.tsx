import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MapLinkPage from '@pages/world/MapLink.page';
// Fork: wrap Studio's WorldNavigation in a collapsible rail so the map
// editor canvas can reclaim horizontal space. See [[project-studio-fork]].
import { CollapsibleWorldNav as WorldNavigation } from '@src/custom/MapEditor/CollapsibleWorldNav';
import { MapPage } from '@pages/world/Map.page';
import { RouterPageStyle } from '@components/pages';
import { OverviewPage } from '@pages/world/Overview.page';
import MapLinkV2Page from './MapLinkV2.page';
import { EventPage } from './Event.page';

const WorldRouterComponent = () => {
  return (
    <RouterPageStyle>
      <WorldNavigation />
      <Routes>
        <Route path="maplink" element={<MapLinkPage />} />
        <Route path="maplink2" element={<MapLinkV2Page />} />
        <Route path="events" element={<EventPage />} />
        <Route path="region" element={<Outlet />} />
        <Route path="map" element={<MapPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="/" element={<Navigate to="map" />} />
      </Routes>
    </RouterPageStyle>
  );
};

export default WorldRouterComponent;
