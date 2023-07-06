import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MapLinkPage from '@pages/world/MapLink.page';
import { WorldNavigation } from '@components/world/WorldNavigation';
import { MapPage } from '@pages/world/Map.page';

const WorldPageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

const WorldRouterComponent = () => {
  return (
    <WorldPageStyle>
      <WorldNavigation />
      <Routes>
        <Route path="maplink" element={<MapLinkPage />} />
        <Route path="region" element={<Outlet />} />
        <Route path="map" element={<MapPage />} />
        <Route path="/" element={<Navigate to="map" />} />
      </Routes>
    </WorldPageStyle>
  );
};

export default WorldRouterComponent;
