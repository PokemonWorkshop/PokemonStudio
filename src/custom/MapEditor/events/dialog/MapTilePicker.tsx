import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { loadMapPreview, type MapPreview } from './mapPreview';
import { Dim, FooterBtn, OpBtn, Row, Scrim, SmallInput } from './styles';

/**
 * Pick a destination tile by clicking the actual map, instead of typing X/Y
 * blind. Renders the target map read-only via `loadMapPreview` — it never
 * touches the editor's own map state.
 */

const Dialog = styled.div`
  width: 820px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  border-radius: 10px;
  overflow: hidden;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};

  & *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  & *::-webkit-scrollbar-track {
    background: transparent;
  }
  & *::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.dark24};
    border: 2px solid ${({ theme }) => theme.colors.dark16};
    border-radius: 6px;
  }
  & input {
    box-sizing: border-box;
  }
`;

const TitleBar = styled.div`
  padding: 8px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  ${({ theme }) => theme.fonts.normalMedium};
`;

const Viewport = styled.div`
  flex: 1;
  min-height: 320px;
  overflow: auto;
  padding: 10px;
  background: ${({ theme }) => theme.colors.dark12};
`;

const Stage = styled.div`
  position: relative;
  line-height: 0;
`;

const Canvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  cursor: crosshair;
`;

const Marker = styled.div`
  position: absolute;
  pointer-events: none;
  border: 2px solid ${({ theme }) => theme.colors.primaryBase};
  background: ${({ theme }) => theme.colors.primaryBase}33;
  box-sizing: border-box;
`;

const Message = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text400};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const ZOOMS = [0.5, 1, 2] as const;

type Props = {
  /** The .tmx to render (the destination map). */
  tiledFilename: string;
  /** Shown in the title bar. */
  mapName: string;
  x: number;
  y: number;
  onConfirm: (x: number, y: number) => void;
  onClose: () => void;
};

export const MapTilePicker = ({ tiledFilename, mapName, x, y, onConfirm, onClose }: Props) => {
  const { t } = useTranslation();
  const [{ projectPath }] = useGlobalState();
  const [preview, setPreview] = useState<MapPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [sel, setSel] = useState<{ x: number; y: number }>({ x, y });
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectPath) return;
    let cancelled = false;
    setPreview(null);
    setError(null);
    // Hide passages / system tags / terrain tags — a warp destination should
    // read as a clean map, not one covered in authoring metadata.
    loadMapPreview(projectPath, tiledFilename, { hideMetadataLayers: true })
      .then((p) => !cancelled && setPreview(p))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [projectPath, tiledFilename]);

  // The preview owns a detached canvas; mount it rather than re-painting.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !preview) return;
    host.replaceChildren(preview.canvas);
  }, [preview]);

  const cell = preview ? preview.cellSize * zoom : 0;

  useEffect(() => {
    if (!preview) return;
    preview.canvas.style.width = `${preview.width * cell}px`;
    preview.canvas.style.height = `${preview.height * cell}px`;
  }, [preview, cell]);

  const pick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!preview) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tx = Math.floor((e.clientX - rect.left) / cell);
    const ty = Math.floor((e.clientY - rect.top) / cell);
    if (tx < 0 || ty < 0 || tx >= preview.width || ty >= preview.height) return;
    setSel({ x: tx, y: ty });
  };

  return (
    <Scrim onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <TitleBar>
          {t('me_events_transfer_pick_title')} — {mapName}
        </TitleBar>
        <Viewport>
          {error && <Message>{t('me_events_transfer_pick_failed', { error })}</Message>}
          {!error && !preview && <Message>{t('me_events_transfer_pick_loading')}</Message>}
          {!error && preview && (
            <Stage onClick={pick} style={{ width: preview.width * cell, height: preview.height * cell }}>
              <div ref={hostRef} />
              <Marker style={{ left: sel.x * cell, top: sel.y * cell, width: cell, height: cell }} />
            </Stage>
          )}
        </Viewport>
        <Footer>
          <Dim>X</Dim>
          <SmallInput
            type="number"
            min={0}
            max={preview ? preview.width - 1 : undefined}
            value={sel.x}
            onChange={(e) => setSel({ ...sel, x: Math.max(0, Number(e.target.value) || 0) })}
          />
          <Dim>Y</Dim>
          <SmallInput
            type="number"
            min={0}
            max={preview ? preview.height - 1 : undefined}
            value={sel.y}
            onChange={(e) => setSel({ ...sel, y: Math.max(0, Number(e.target.value) || 0) })}
          />
          {preview && (
            <Dim>
              {t('me_events_transfer_pick_size', { width: preview.width, height: preview.height })}
            </Dim>
          )}
          <div style={{ flex: 1 }} />
          {ZOOMS.map((z) => (
            <OpBtn key={z} onClick={() => setZoom(z)} title={`${z}×`} style={{ opacity: zoom === z ? 1 : 0.55 }}>
              {z}×
            </OpBtn>
          ))}
          <FooterBtn onClick={onClose}>{t('me_events_cancel')}</FooterBtn>
          <FooterBtn $primary disabled={!preview} onClick={() => onConfirm(sel.x, sel.y)}>
            {t('me_events_ok')}
          </FooterBtn>
        </Footer>
      </Dialog>
    </Scrim>
  );
};
