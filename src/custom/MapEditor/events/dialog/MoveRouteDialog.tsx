import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  createEmptyMoveRoute,
  decodeMoveCommand,
  MOVE_COMMANDS,
  MOVE_COMMAND_BY_CODE,
  type MoveCmdKind,
  type MoveCommandSpec,
  type RMXPMoveRoute,
  type WorkingMoveCommand,
} from '../rmxpEventUtils';
import { BlockTitle, CheckLabel, Dim, FooterBtn, OpBtn, Row, Scrim, SmallInput, SmallSelect } from './styles';
import { AudioPicker, type AudioFile } from './AudioPicker';
import { NamePicker } from './fields';
import { ScriptEditor } from './ScriptEditor';

/**
 * RMXP's "Move Route" window, restyled for Studio: the route list on the left,
 * the command palette in RMXP's three columns on the right, and the Repeat /
 * Ignore options underneath. Used both for a page's autonomous route and (later)
 * for the Set Move Route command, which adds the target picker.
 *
 * Editing preserves provenance: a command the user doesn't touch keeps its
 * `__keep` index, so rich params (a Play SE's RPG::AudioFile) round-trip
 * byte-faithfully instead of being rebuilt from lossy JSON.
 */

const Dialog = styled.div`
  width: 780px;
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
  & input,
  & textarea,
  & select {
    box-sizing: border-box;
  }
`;

const TitleBar = styled.div`
  padding: 8px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  ${({ theme }) => theme.fonts.normalMedium};
`;

const Body = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  min-height: 0;
  flex: 1;
`;

const LeftPane = styled.div`
  width: 244px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`;

const RouteList = styled.div`
  flex: 1;
  min-height: 260px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.55;
  padding: 4px 0;
`;

const RouteRow = styled.div<{ $selected: boolean; $blank: boolean }>`
  padding: 2px 10px;
  cursor: pointer;
  white-space: pre-wrap;
  color: ${({ theme, $blank }) => ($blank ? theme.colors.text500 : theme.colors.text100)};
  background: ${({ theme, $selected }) => ($selected ? `${theme.colors.primarySoft}44` : 'transparent')};
  border-left: 2px solid ${({ theme, $selected }) => ($selected ? theme.colors.primaryBase : 'transparent')};
  &:hover {
    background: ${({ theme, $selected }) => ($selected ? `${theme.colors.primarySoft}44` : theme.colors.dark18)};
  }
`;

const Palette = styled.div`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  align-content: start;
  overflow-y: auto;
`;

const PaletteColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PaletteBtn = styled.button`
  all: unset;
  cursor: pointer;
  text-align: center;
  padding: 5px 6px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background: ${({ theme }) => theme.colors.dark20};
    border-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const ParamForm = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/** Draft parameters for a command that needs input before it can be appended. */
type PendingCmd = {
  spec: MoveCommandSpec;
  jumpX: number;
  jumpY: number;
  frames: number;
  switchId: number;
  value: number;
  graphic: string;
  hue: number;
  direction: number;
  pattern: number;
  audioName: string;
  volume: number;
  pitch: number;
  script: string;
};

const emptyPending = (spec: MoveCommandSpec): PendingCmd => ({
  spec,
  jumpX: 0,
  jumpY: 0,
  frames: 20,
  switchId: 1,
  value: spec.kind === 'opacity' ? 255 : spec.kind === 'blend' ? 0 : 3,
  graphic: '',
  hue: 0,
  direction: 2,
  pattern: 0,
  audioName: '',
  volume: 100,
  pitch: 100,
  script: '',
});

/** Commands whose parameters must be filled in before they can be added. */
const NEEDS_FORM: ReadonlySet<MoveCmdKind> = new Set(['jump', 'wait', 'switch', 'speed', 'freq', 'graphic', 'opacity', 'blend', 'se', 'script']);

const buildParams = (p: PendingCmd): unknown[] => {
  switch (p.spec.kind) {
    case 'jump':
      return [p.jumpX, p.jumpY];
    case 'wait':
      return [Math.max(1, p.frames)];
    case 'switch':
      return [p.switchId];
    case 'speed':
    case 'freq':
      return [Math.min(6, Math.max(1, p.value))];
    case 'opacity':
      return [Math.min(255, Math.max(0, p.value))];
    case 'blend':
      return [Math.min(2, Math.max(0, p.value))];
    case 'graphic':
      // The writer strips any extension — RPG::Cache resolves the bare name.
      return [p.graphic, p.hue, p.direction, p.pattern];
    case 'se':
      // Plain shape; writeRMXPEvents marshals it into an RPG::AudioFile.
      return [{ name: p.audioName, volume: p.volume, pitch: p.pitch }];
    case 'script':
      return [p.script];
    default:
      return [];
  }
};

type Props = {
  route: RMXPMoveRoute;
  /** Shown in the title bar — e.g. the event's name, or the chosen target. */
  subject?: string;
  systemNames: { switches: string[]; variables: string[] };
  /** Files in Audio/se — the Play SE step browses them. */
  audioFiles: AudioFile[];
  /** Rendered above the route list — the Set Move Route target picker. */
  targetPicker?: React.ReactNode;
  onApply: (route: RMXPMoveRoute) => void;
  onClose: () => void;
};

export const MoveRouteDialog = ({ route, subject, systemNames, audioFiles, targetPicker, onApply, onClose }: Props) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RMXPMoveRoute>(() => ({ ...route, list: [...route.list] }));
  const [sel, setSel] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingCmd | null>(null);

  const label = useMemo(() => (key: string) => t(`me_move_${key}`), [t]);
  const list = draft.list as WorkingMoveCommand[];

  const setList = (next: WorkingMoveCommand[]) => setDraft((prev) => ({ ...prev, list: next }));

  /** Insert above the selection, or before the trailing blank terminator. */
  const insertAt = () => {
    if (sel !== null && list[sel] && list[sel].code !== 0) return sel + 1;
    if (sel !== null && list[sel]?.code === 0) return sel;
    const last = list[list.length - 1];
    return last && last.code === 0 ? list.length - 1 : list.length;
  };

  const append = (spec: MoveCommandSpec, params: unknown[]) => {
    const next = [...list];
    const at = insertAt();
    next.splice(at, 0, { code: spec.code, parameters: params });
    setList(next);
    setSel(at);
    setPending(null);
  };

  const onPaletteClick = (spec: MoveCommandSpec) => {
    if (NEEDS_FORM.has(spec.kind)) return setPending(emptyPending(spec));
    append(spec, []);
  };

  const removeSelected = () => {
    if (sel === null) return;
    const cmd = list[sel];
    if (!cmd || cmd.code === 0) return; // never delete the terminator
    const next = [...list];
    next.splice(sel, 1);
    setList(next);
    setSel(null);
  };

  const move = (dir: -1 | 1) => {
    if (sel === null) return;
    const target = sel + dir;
    const cmd = list[sel];
    const other = list[target];
    if (!cmd || !other || cmd.code === 0 || other.code === 0) return;
    const next = [...list];
    next[sel] = other;
    next[target] = cmd;
    setList(next);
    setSel(target);
  };

  const clearAll = () => {
    setList(createEmptyMoveRoute().list);
    setSel(null);
    setPending(null);
  };

  const columns: MoveCommandSpec[][] = [0, 1, 2].map((c) => MOVE_COMMANDS.filter((spec) => spec.column === c));

  return (
    <Scrim onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Dialog>
        <TitleBar>
          {t('me_move_title')}
          {subject ? ` — ${subject}` : ''}
        </TitleBar>
        <Body>
          <LeftPane>
            {targetPicker}
            <RouteList>
              {list.map((cmd, i) => (
                <RouteRow
                  key={i}
                  $selected={sel === i}
                  $blank={cmd.code === 0}
                  onClick={() => setSel(i)}
                >
                  {cmd.code === 0 ? '$>' : `$> ${decodeMoveCommand(cmd, label, systemNames)}`}
                </RouteRow>
              ))}
            </RouteList>
            <Row>
              <OpBtn onClick={() => move(-1)} disabled={sel === null}>↑</OpBtn>
              <OpBtn onClick={() => move(1)} disabled={sel === null}>↓</OpBtn>
              <OpBtn onClick={removeSelected} disabled={sel === null || list[sel]?.code === 0} $danger>
                {t('me_events_cmd_delete')}
              </OpBtn>
              <OpBtn onClick={clearAll} style={{ marginLeft: 'auto' }}>{t('me_events_clear_page')}</OpBtn>
            </Row>
            <div>
              <CheckLabel title={t('me_move_repeat_hint')}>
                <input type="checkbox" checked={draft.isRepeat} onChange={(e) => setDraft((p) => ({ ...p, isRepeat: e.target.checked }))} />
                {t('me_move_repeat')}
              </CheckLabel>
              <CheckLabel title={t('me_move_skippable_hint')} style={{ marginTop: 4 }}>
                <input type="checkbox" checked={draft.isSkippable} onChange={(e) => setDraft((p) => ({ ...p, isSkippable: e.target.checked }))} />
                {t('me_move_skippable')}
              </CheckLabel>
            </div>
          </LeftPane>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending ? (
              <ParamForm>
                <BlockTitle style={{ margin: 0 }}>{label(pending.spec.key)}</BlockTitle>
                {pending.spec.kind === 'jump' && (
                  <Row>
                    <Dim>X</Dim>
                    <SmallInput type="number" value={pending.jumpX} autoFocus onChange={(e) => setPending({ ...pending, jumpX: Number(e.target.value) || 0 })} />
                    <Dim>Y</Dim>
                    <SmallInput type="number" value={pending.jumpY} onChange={(e) => setPending({ ...pending, jumpY: Number(e.target.value) || 0 })} />
                  </Row>
                )}
                {pending.spec.kind === 'wait' && (
                  <Row>
                    <Dim>{t('me_events_cmd_wait_frames')}</Dim>
                    <SmallInput type="number" min={1} value={pending.frames} autoFocus onChange={(e) => setPending({ ...pending, frames: Number(e.target.value) || 1 })} />
                  </Row>
                )}
                {pending.spec.kind === 'switch' && (
                  <Row>
                    <Dim>{t('me_events_switch')}</Dim>
                    <NamePicker names={systemNames.switches} value={pending.switchId} onChange={(id) => setPending({ ...pending, switchId: id })} />
                  </Row>
                )}
                {(pending.spec.kind === 'speed' || pending.spec.kind === 'freq') && (
                  <Row>
                    <Dim>{label(pending.spec.key)}</Dim>
                    <SmallSelect value={pending.value} onChange={(e) => setPending({ ...pending, value: Number(e.target.value) })}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </SmallSelect>
                  </Row>
                )}
                {pending.spec.kind === 'opacity' && (
                  <Row>
                    <Dim>{t('me_events_opacity')}</Dim>
                    <SmallInput type="number" min={0} max={255} value={pending.value} autoFocus onChange={(e) => setPending({ ...pending, value: Number(e.target.value) || 0 })} />
                  </Row>
                )}
                {pending.spec.kind === 'blend' && (
                  <Row>
                    <Dim>{label(pending.spec.key)}</Dim>
                    <SmallSelect value={pending.value} onChange={(e) => setPending({ ...pending, value: Number(e.target.value) })}>
                      {[0, 1, 2].map((n) => (
                        <option key={n} value={n}>{t(`me_move_blend_${n}`)}</option>
                      ))}
                    </SmallSelect>
                  </Row>
                )}
                {pending.spec.kind === 'graphic' && (
                  <>
                    <Row>
                      <Dim>{t('me_events_graphic')}</Dim>
                      <SmallInput type="text" style={{ flex: 1, width: 'auto' }} value={pending.graphic} autoFocus placeholder={t('me_move_graphic_ph')} onChange={(e) => setPending({ ...pending, graphic: e.target.value })} />
                    </Row>
                    <Row>
                      <Dim>{t('me_events_direction')}</Dim>
                      <SmallSelect value={pending.direction} onChange={(e) => setPending({ ...pending, direction: Number(e.target.value) })}>
                        {[
                          [2, 'down'],
                          [4, 'left'],
                          [6, 'right'],
                          [8, 'up'],
                        ].map(([v, k]) => (
                          <option key={v} value={v}>{t(`me_events_dir_${k}`)}</option>
                        ))}
                      </SmallSelect>
                      <Dim>{t('me_events_pattern')}</Dim>
                      <SmallSelect value={pending.pattern} onChange={(e) => setPending({ ...pending, pattern: Number(e.target.value) })}>
                        {[0, 1, 2, 3].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </SmallSelect>
                    </Row>
                  </>
                )}
                {pending.spec.kind === 'se' && (
                  <AudioPicker
                    files={audioFiles}
                    folder="se"
                    value={pending.audioName}
                    volume={pending.volume}
                    pitch={pending.pitch}
                    onChange={(audioName) => setPending({ ...pending, audioName })}
                    onVolumeChange={(volume) => setPending({ ...pending, volume })}
                    onPitchChange={(pitch) => setPending({ ...pending, pitch })}
                  />
                )}
                {pending.spec.kind === 'script' && <ScriptEditor value={pending.script} onChange={(script) => setPending({ ...pending, script })} autoFocus />}
                <Row>
                  <OpBtn onClick={() => append(pending.spec, buildParams(pending))}>{t('me_events_ok')}</OpBtn>
                  <OpBtn onClick={() => setPending(null)}>{t('me_events_cancel')}</OpBtn>
                </Row>
              </ParamForm>
            ) : null}
            <Palette>
              {columns.map((column, i) => (
                <PaletteColumn key={i}>
                  {column.map((spec) => (
                    <PaletteBtn key={spec.code} onClick={() => onPaletteClick(spec)} title={label(spec.key)}>
                      {label(spec.key)}
                      {NEEDS_FORM.has(spec.kind) ? '…' : ''}
                    </PaletteBtn>
                  ))}
                </PaletteColumn>
              ))}
            </Palette>
          </div>
        </Body>
        <Footer>
          <Dim>{t('me_move_hint')}</Dim>
          <span style={{ flex: 1 }} />
          <FooterBtn $primary onClick={() => onApply(draft)}>{t('me_events_ok')}</FooterBtn>
          <FooterBtn onClick={onClose}>{t('me_events_cancel')}</FooterBtn>
        </Footer>
      </Dialog>
    </Scrim>
  );
};

// Re-exported so callers don't need to reach into rmxpEventUtils for the lookup.
export { MOVE_COMMAND_BY_CODE };
