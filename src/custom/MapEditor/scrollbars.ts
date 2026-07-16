import { css } from 'styled-components';

/**
 * Fork-owned. Studio-themed scrollbars for any scroll container and all of its
 * descendants. The default OS bars read as jarringly bright against the dark map
 * editor chrome, so every scrollable surface in the editor opts into this.
 *
 * Mirrors the block already inlined in the event dialog's styles.ts (kept there
 * to avoid a cross-import from that self-contained module); this is the shared
 * copy for the rest of the map editor. Applied with `& *::` so a single mixin on
 * a page/panel root themes every nested scroller (canvas host, tileset palette,
 * layer list, world navigation, …) without touching each one.
 */
export const themedScrollbars = css`
  & *::-webkit-scrollbar,
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  & *::-webkit-scrollbar-track,
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  & *::-webkit-scrollbar-thumb,
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.dark24};
    border: 2px solid ${({ theme }) => theme.colors.dark16};
    border-radius: 6px;
  }
  & *::-webkit-scrollbar-thumb:hover,
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.dark20};
  }
  & *::-webkit-scrollbar-corner,
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`;
