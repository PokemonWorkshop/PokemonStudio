import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useProjectMaps } from '@hooks/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { Toggle } from '@components/inputs';

/**
 * Fork-owned. Pick which pending maps to write, per kind.
 *
 * Editing several maps before saving is the whole point of the pending store,
 * so the save step needs to be a choice rather than an all-or-nothing button:
 * a row per map, a column for its tiles and one for its events, each tickable
 * only when that kind actually has something unsaved.
 */

export type SaveSelection = { dbSymbol: string; tiles: boolean; events: boolean };

/**
 * One row of the dialog. Deliberately NOT PendingMapEdit: the map currently
 * open has unsaved tiles that live in the canvas, not in the pending store
 * (tiles are only parked when you switch away). Taking a flag instead of the
 * byte payload lets the live map appear alongside the parked ones.
 */
export type SaveMapRow = { dbSymbol: string; hasTiles: boolean; hasEvents: boolean };

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  /*
   * Entry only, via @starting-style -- no mount flag, no JS. These modals used
   * to teleport in at full opacity while Studio's own EditorOverlayV2 dialogs
   * fade, which made the fork's dialogs read as cheaper than the host app's.
   */
  transition: opacity ${({ theme }) => theme.motion.durModal} ease;

  @starting-style {
    opacity: 0;
  }
`;

const Dialog = styled.div`
  width: min(640px, 90vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  /*
   * Scales from 0.96, never from 0 -- a dialog growing from nothing reads as a
   * zoom effect rather than as something arriving. Centred modals keep
   * transform-origin at the centre; only trigger-anchored surfaces (menus)
   * origin at their trigger.
   */
  transition: opacity ${({ theme }) => theme.motion.durModal} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.durModal} ${({ theme }) => theme.motion.easeOut};

  @starting-style {
    opacity: 0;
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity ${({ theme }) => theme.motion.durModal} ease;

    @starting-style {
      transform: none;
    }
  }
`;

const Title = styled.h3`
  margin: 0;
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
`;

const Hint = styled.p`
  margin: 0;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const Table = styled.div`
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 6px;
`;

const Row = styled.div<{ $head?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 160px 160px 80px 80px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme, $head }) => ($head ? theme.colors.text400 : theme.colors.text100)};
  background: ${({ theme, $head }) => ($head ? theme.colors.dark18 : 'transparent')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};

  &:last-child {
    border-bottom: none;
  }

  & .rxdata {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text500};
    font-family: 'Consolas', 'Monaco', monospace;
  }

  & .col {
    display: flex;
    justify-content: center;
  }

  & input[type='checkbox']:disabled {
    opacity: 0.3;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  ${({ theme }) => theme.fonts.normalMedium};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid ${({ theme, $primary }) => ($primary ? theme.colors.primaryBase : theme.colors.dark20)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.primaryBase : theme.colors.dark20)};
  color: ${({ theme, $primary }) => ($primary ? theme.colors.text100 : theme.colors.text400)};

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

type Props = {
  rows: SaveMapRow[];
  onCancel: () => void;
  onConfirm: (selection: SaveSelection[]) => void;
};

export const SaveMapsDialog = ({ rows, onCancel, onConfirm }: Props) => {
  const { t } = useTranslation();
  const { projectDataValues: maps } = useProjectMaps();
  const getMapName = useGetEntityNameText();

  /** The map's display name, not its db_symbol — that's what users recognise. */
  const displayName = (dbSymbol: string) => {
    const record = maps[dbSymbol];
    return record ? getMapName(record) : dbSymbol;
  };

  /** The file this save actually writes. */
  const tmxName = (dbSymbol: string) => {
    const record = maps[dbSymbol];
    return record?.tiledFilename ? `${record.tiledFilename}.tmx` : '—';
  };

  /** The file PSDK will regenerate from this map, so the row is traceable on disk. */
  const rxdataName = (dbSymbol: string) => {
    const record = maps[dbSymbol];
    return record ? `Map${String(record.id).padStart(3, '0')}.rxdata` : '—';
  };
  // Everything with pending work starts ticked — the common case is "write it
  // all", and unticking is easier than hunting for the one you want.
  const [selection, setSelection] = React.useState<Record<string, { tiles: boolean; events: boolean }>>(() =>
    Object.fromEntries(rows.map((row) => [row.dbSymbol, { tiles: row.hasTiles, events: row.hasEvents }]))
  );

  const toggle = (dbSymbol: string, kind: 'tiles' | 'events', value: boolean) =>
    setSelection((prev) => ({ ...prev, [dbSymbol]: { ...prev[dbSymbol], [kind]: value } }));

  /** Header checkbox: ticks/unticks the whole column, skipping rows with nothing pending. */
  const toggleColumn = (kind: 'tiles' | 'events', value: boolean) =>
    setSelection((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        if (!(kind === 'tiles' ? row.hasTiles : row.hasEvents)) return;
        next[row.dbSymbol] = { ...next[row.dbSymbol], [kind]: value };
      });
      return next;
    });

  const columnState = (kind: 'tiles' | 'events') => {
    const available = rows.filter((row) => (kind === 'tiles' ? row.hasTiles : row.hasEvents));
    if (available.length === 0) return { checked: false, disabled: true };
    return { checked: available.every((row) => selection[row.dbSymbol]?.[kind]), disabled: false };
  };

  const chosen = rows
    .map((row) => ({
      dbSymbol: row.dbSymbol,
      tiles: row.hasTiles && !!selection[row.dbSymbol]?.tiles,
      events: row.hasEvents && !!selection[row.dbSymbol]?.events,
    }))
    .filter((row) => row.tiles || row.events);

  const tilesCol = columnState('tiles');
  const eventsCol = columnState('events');

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  return (
    <Scrim onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <Dialog>
        <Title>{t('save_maps_dialog_title')}</Title>
        <Hint>{t('save_maps_dialog_hint')}</Hint>
        <Table>
          <Row $head>
            <span>{t('save_maps_dialog_map')}</span>
            <span>{t('save_maps_dialog_writes')}</span>
            <span>{t('save_maps_dialog_file')}</span>
            <span className="col">
              <label style={{ display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                <Toggle checked={tilesCol.checked} disabled={tilesCol.disabled} onChange={(e) => toggleColumn('tiles', e.target.checked)} />
                {t('save_maps_dialog_tiles')}
              </label>
            </span>
            <span className="col">
              <label style={{ display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                <Toggle checked={eventsCol.checked} disabled={eventsCol.disabled} onChange={(e) => toggleColumn('events', e.target.checked)} />
                {t('save_maps_dialog_events')}
              </label>
            </span>
          </Row>
          {rows.map((row) => (
            <Row key={row.dbSymbol}>
              <span>{displayName(row.dbSymbol)}</span>
              <span className="rxdata">{tmxName(row.dbSymbol)}</span>
              <span className="rxdata">{rxdataName(row.dbSymbol)}</span>
              <span className="col">
                <Toggle
                  disabled={!row.hasTiles}
                  checked={row.hasTiles && !!selection[row.dbSymbol]?.tiles}
                  onChange={(e) => toggle(row.dbSymbol, 'tiles', e.target.checked)}
                />
              </span>
              <span className="col">
                <Toggle
                  disabled={!row.hasEvents}
                  checked={row.hasEvents && !!selection[row.dbSymbol]?.events}
                  onChange={(e) => toggle(row.dbSymbol, 'events', e.target.checked)}
                />
              </span>
            </Row>
          ))}
        </Table>
        <Actions>
          <Btn type="button" onClick={onCancel}>
            {t('save_maps_dialog_cancel')}
          </Btn>
          <Btn type="button" $primary disabled={chosen.length === 0} onClick={() => onConfirm(chosen)}>
            {t('save_maps_dialog_confirm', { count: chosen.length })}
          </Btn>
        </Actions>
      </Dialog>
    </Scrim>
  );
};
