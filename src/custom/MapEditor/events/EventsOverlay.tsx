import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGlobalState } from '@src/GlobalStateProvider';
import type { MapEvent } from './useMapEvents';
import { CharacterSprite } from './CharacterSprite';

/**
 * Event markers drawn over the map canvas (inside PixiMapCanvas's PixiHost,
 * which is position: relative and exactly the size of the rendered map).
 *
 * Tiles mode: pointer-events pass through (markers are informational).
 * Events mode: the overlay owns the mouse — click selects, double-click on a
 * marker opens the dialog, double-click on an empty cell creates an event,
 * drag moves an event.
 */

const OverlayRoot = styled.div<{ $interactive: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: ${({ $interactive }) => ($interactive ? 'auto' : 'none')};
`;

const Marker = styled.div<{ $selected: boolean }>`
  position: absolute;
  box-sizing: border-box;
  border: 2px solid ${({ theme, $selected }) => ($selected ? theme.colors.primaryBase : 'rgba(255, 255, 255, 0.65)')};
  border-radius: 3px;
  background: ${({ theme, $selected }) => ($selected ? `${theme.colors.primarySoft}55` : 'rgba(20, 20, 28, 0.35)')};
  cursor: pointer;
  /* Sprites can be larger than one tile — let them overflow like in-game,
     anchored to the tile's bottom-center. */
  overflow: visible;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

const SpriteAnchor = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
`;

const NameTag = styled.div`
  position: absolute;
  transform: translateY(-100%);
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.dark18};
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  color: ${({ theme }) => theme.colors.text100};
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 4;
`;

type Props = {
  events: MapEvent[];
  tileSize: number; // tilewidth * zoom, in css px
  mode: 'tiles' | 'events';
  visible: boolean;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onOpen: (id: number) => void;
  onCreate: (x: number, y: number) => void;
  onMove: (id: number, x: number, y: number) => void;
};

export const EventsOverlay = ({ events, tileSize, mode, visible, selectedId, onSelect, onOpen, onCreate, onMove }: Props) => {
  const [{ projectPath }] = useGlobalState();
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; moved: boolean } | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const cellFromMouse = useCallback(
    (e: React.MouseEvent): { x: number; y: number } | null => {
      const root = rootRef.current;
      if (!root) return null;
      const rect = root.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / tileSize);
      const y = Math.floor((e.clientY - rect.top) / tileSize);
      if (x < 0 || y < 0) return null;
      return { x, y };
    },
    [tileSize],
  );

  const onRootMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== 'events') return;
      // Never let the tile-paint handlers underneath see this interaction.
      e.stopPropagation();
      if (e.button !== 0) return;
      const cell = cellFromMouse(e);
      if (!cell) return;
      const hit = events.find((ev) => ev.x === cell.x && ev.y === cell.y);
      onSelect(hit ? hit.id : null);
      if (hit) dragRef.current = { id: hit.id, startX: cell.x, startY: cell.y, moved: false };
    },
    [mode, cellFromMouse, events, onSelect],
  );

  const onRootMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) return;
      const cell = cellFromMouse(e);
      if (!cell) return;
      const drag = dragRef.current;
      if (cell.x === drag.startX && cell.y === drag.startY && !drag.moved) return;
      // Don't drop onto another event's tile.
      if (events.some((ev) => ev.id !== drag.id && ev.x === cell.x && ev.y === cell.y)) return;
      drag.moved = true;
      drag.startX = cell.x;
      drag.startY = cell.y;
      onMove(drag.id, cell.x, cell.y);
    },
    [cellFromMouse, events, onMove],
  );

  const onRootMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onRootDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== 'events') return;
      e.stopPropagation();
      const cell = cellFromMouse(e);
      if (!cell) return;
      const hit = events.find((ev) => ev.x === cell.x && ev.y === cell.y);
      if (hit) onOpen(hit.id);
      else onCreate(cell.x, cell.y);
    },
    [mode, cellFromMouse, events, onOpen, onCreate],
  );

  // Hiding events fully removes them in Tiles mode; in Events mode they stay as
  // a translucent overlay (see per-marker opacity) so you can still place/edit
  // against the bare map.
  if (!visible && mode !== 'events') return null;

  return (
    <OverlayRoot
      ref={rootRef}
      $interactive={mode === 'events'}
      onMouseDown={onRootMouseDown}
      onMouseMove={onRootMouseMove}
      onMouseUp={onRootMouseUp}
      onDoubleClick={onRootDoubleClick}
    >
      {events.map((event) => {
        const page = event.pages[0];
        const graphic = page?.graphic;
        const hasSprite = !!graphic && !graphic.tileId && !!graphic.characterName && !!projectPath;
        // PSDK renders overworld character sprites (small pixel art) at 2×, so a
        // 16-px cell fills a 32-px tile. We mirror that: 2 × (tileSize / 32)
        // gives the true in-game footprint, staying pixel-accurate at any zoom.
        const spriteScale = 2 * (tileSize / 32);
        // In Events mode, "hiding" events dims them to a translucent overlay
        // (rather than removing them) so the bare map stays visible while you
        // work — the one you're interacting with (selected/hovered) stays solid.
        const dimmed = mode === 'events' && !visible && selectedId !== event.id && hoveredId !== event.id;
        return (
          <React.Fragment key={event.id}>
            <Marker
              $selected={selectedId === event.id}
              style={{ left: event.x * tileSize, top: event.y * tileSize, width: tileSize, height: tileSize, opacity: dimmed ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId((prev) => (prev === event.id ? null : prev))}
            >
              {hasSprite && (
                <SpriteAnchor>
                  <CharacterSprite
                    projectPath={projectPath!}
                    characterName={graphic.characterName}
                    direction={graphic.direction}
                    pattern={graphic.pattern}
                    fitW={Number.MAX_SAFE_INTEGER}
                    fitH={Number.MAX_SAFE_INTEGER}
                    exactScale={spriteScale}
                  />
                </SpriteAnchor>
              )}
            </Marker>
            {(hoveredId === event.id || selectedId === event.id) && (
              <NameTag style={{ left: event.x * tileSize, top: event.y * tileSize - 2 }}>
                {event.name} · {event.id}
              </NameTag>
            )}
          </React.Fragment>
        );
      })}
    </OverlayRoot>
  );
};
