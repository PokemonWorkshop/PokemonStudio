/**
 * Fork-owned wrapper around Studio's WorldNavigation (the Maps/Events tab
 * + map list panel). Adds a collapse-to-rail toggle so map editing sessions
 * can reclaim ~300px of horizontal canvas room.
 *
 * Persists collapsed state to localStorage so the user's preference
 * survives navigation and reloads.
 *
 * Upstream conflict surface: ONE line in World.Router.page.tsx (changing
 * `<WorldNavigation />` to `<CollapsibleWorldNav />`). If upstream rewrites
 * that file, the conflict is trivial — just re-apply the swap.
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { WorldNavigation } from '@components/world/WorldNavigation';

const STORAGE_KEY = 'pokemonstudio.fork.worldNav.collapsed';

const Wrap = styled.div<{ $collapsed: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: ${({ $collapsed }) => ($collapsed ? '24px' : 'auto')};
  width: ${({ $collapsed }) => ($collapsed ? '24px' : 'auto')};
  transition: width 120ms ease, min-width 120ms ease;
`;

const ToggleButton = styled.button<{ $collapsed: boolean }>`
  all: unset;
  position: absolute;
  top: 12px;
  right: ${({ $collapsed }) => ($collapsed ? '-1px' : '-1px')};
  width: 18px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark12};
  border-radius: 0 6px 6px 0;
  color: ${({ theme }) => theme.colors.text400};
  cursor: pointer;
  font-family: monospace;
  font-size: 14px;
  z-index: 5;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const CollapsedRail = styled.div`
  width: 24px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
`;

export const CollapsibleWorldNav: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch { /* ignored */ }
  }, [collapsed]);

  return (
    <Wrap $collapsed={collapsed}>
      {collapsed ? <CollapsedRail /> : <WorldNavigation />}
      <ToggleButton
        $collapsed={collapsed}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Show maps panel' : 'Hide maps panel'}
      >
        {collapsed ? '›' : '‹'}
      </ToggleButton>
    </Wrap>
  );
};
