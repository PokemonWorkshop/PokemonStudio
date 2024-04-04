import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MapLinkPage from '@pages/world/MapLink.page';
import { WorldNavigation } from '@components/world/WorldNavigation';
import { MapPage } from '@pages/world/Map.page';
import { RouterPageStyle } from '@components/pages';
import { OverviewPage } from '@pages/world/Overview.page';

const WorldRouterComponent = () => {
  return (
    <RouterPageStyle>
      <WorldNavigation />
      <Routes>
        <Route path="maplink" element={<MapLinkPage />} />
        <Route path="region" element={<Outlet />} />
        <Route path="map" element={<MapPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="/" element={<Navigate to="map" />} />
      </Routes>
    </RouterPageStyle>
  );
};

export default WorldRouterComponent;
