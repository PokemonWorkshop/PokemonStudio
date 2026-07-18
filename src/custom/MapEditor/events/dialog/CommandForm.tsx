import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { SelectItem } from '@components/selects/SelectItem';
import { SelectMove } from '@components/selects/SelectMove';
import { SelectNature } from '@components/selects/SelectNature';
import { BlockTitle, CheckLabel, CmdGroupTitle, DIALOG_BODY_ATTR, Dim, FormArea, FormTextArea, OpBtn, Row, SmallInput, SmallSelect } from './styles';
import { ScriptEditor } from './ScriptEditor';
import { NamePicker, OnOff } from './fields';
import { DIRECTIONS } from '../rmxpEventUtils';
import { AUDIO_KINDS, canSubmitForm, clamp, emptyChoice, emptyCond, isAudioKind, STAT_KEYS, VAR_OPS, type ChoiceEntry, type CmdForm, type CondEntry } from './commandModel';
import { AudioPicker, type AudioFile } from './AudioPicker';
import { MapTilePicker } from './MapTilePicker';
import { PicturePicker } from './PicturePicker';
import { TonePreview } from './TonePreview';
import { ShakePreview } from './ShakePreview';
import { WeatherPreview } from './WeatherPreview';

/**
 * Wrapper that keeps an @ds/Select popover fully visible inside the command form.
 *
 * @ds/Select renders its `.select-popover` `position: absolute` inside the field,
 * so the dialog body's `overflow: hidden` CLIPS it — a dropdown near the bottom
 * (or in a short full-screen panel) gets cut off. We can't just raise its
 * z-index; absolute stays inside the clipping box.
 *
 * Fix: pin the popover to the VIEWPORT with `position: fixed` (which no ancestor
 * overflow can clip). This is safe ONLY because the event dialog has no
 * transformed ancestor — an app-wide change to @ds/Select would break selects
 * inside EditorOverlayV2 (which uses `transform`), so we scope it here. Left is
 * pinned to the field; the vertical direction still yields to the body's free
 * space so a bottom-of-panel select opens upward. Both are set on pointerdown
 * (which precedes the focus that opens the popover) via CSS custom properties,
 * so our `!important` rules override @ds/Select's own inline top/bottom.
 */
const SelectFieldRoot = styled.div`
  flex: 1;
  min-width: 0;

  & .select-popover {
    position: fixed !important;
    left: var(--pop-left, 0) !important;
    top: var(--pop-top, auto) !important;
    bottom: var(--pop-bottom, auto) !important;
    z-index: 6000 !important;
  }
`;

/** @ds/Select's SELECT_CLEARANCE (195, max popover height) + SELECT_SPACING (7). */
const DROPDOWN_SPACE = 202;
const POPOVER_GAP = 7;

/**
 * Move slots sit two-per-row so the creature form fits the panel at the default
 * window size. Falls back to one column when the dialog is narrow — Studio's
 * dropdown needs 240px, so a cramped second column would overflow.
 */
const MoveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 6px;
  margin-bottom: 6px;
`;

const SelectField = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Runs before the list becomes visible (pointerdown precedes the focus that
  // opens it): pin the popover to the field's current viewport rect and pick a
  // direction from the dialog body's free space.
  const position = () => {
    const el = ref.current;
    if (!el) return;
    const field = el.getBoundingClientRect();
    el.style.setProperty('--pop-left', `${field.left}px`);
    const clip = el.closest(`[${DIALOG_BODY_ATTR}]`);
    const bounds = clip?.getBoundingClientRect();
    const below = bounds ? bounds.bottom - field.bottom : window.innerHeight - field.bottom;
    const above = bounds ? field.top - bounds.top : field.top;
    const openUp = below < DROPDOWN_SPACE && above > below;
    if (openUp) {
      el.style.setProperty('--pop-top', 'auto');
      el.style.setProperty('--pop-bottom', `${window.innerHeight - field.top + POPOVER_GAP}px`);
    } else {
      el.style.setProperty('--pop-bottom', 'auto');
      el.style.setProperty('--pop-top', `${field.bottom + POPOVER_GAP}px`);
    }
  };
  return (
    <SelectFieldRoot ref={ref} title={title} onPointerDownCapture={position}>
      {children}
    </SelectFieldRoot>
  );
};

type Props = {
  form: CmdForm;
  setForm: (f: CmdForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  systemNames: { switches: string[]; variables: string[] };
  /** Files in the Audio/ folder for the open audio command, without extension. */
  audioFiles: AudioFile[];
  /** Every map in the project — the Transfer Player picker lists them. */
  projectMaps: { id: number; name: string; tiledFilename: string }[];
  /** Common events by id + name, for Call Common Event. */
  commonEvents: { id: number; name: string }[];
  /** Bare names in Graphics/Pictures, for Show Picture. */
  pictureFiles: string[];
  /** Events on THIS map, for the per-event move wait. */
  mapEvents: { id: number; name: string }[];
  resolveCsv: (fileId: number, line: number) => string | undefined;
  pageLabels: string[];
  /** Capture a PNG data URL of the current map — used for the tone command's on-map preview. */
  getMapSnapshot?: () => string | null;
  /** Map size in tiles — frames the shake command's in-game preview. */
  mapWidthTiles?: number;
  mapHeightTiles?: number;
  /** Id of the current map — used to pick a tile for Set Event Location. */
  currentMapId?: number;
  /** When set, the Call Common Event form shows an "Edit common events" button. */
  onEditCommonEvents?: () => void;
};

/**
 * The command editor form (the panel that opens when inserting or editing a
 * single command). Kept self-contained: it edits a `CmdForm` value via
 * `setForm` and commits through `onSubmit` — the dialog shell owns where the
 * resulting command lands in the list.
 */
export const CommandForm = ({ form, setForm, onSubmit, onCancel, systemNames, audioFiles, projectMaps, commonEvents, pictureFiles, mapEvents, resolveCsv, pageLabels, getMapSnapshot, mapWidthTiles, mapHeightTiles, currentMapId, onEditCommonEvents }: Props) => {
  const { t } = useTranslation();
  const [{ projectText, projectPath }] = useGlobalState();
  const [showTranslations, setShowTranslations] = useState(false);
  const [tilePickerOpen, setTilePickerOpen] = useState(false);
  const [locPickerOpen, setLocPickerOpen] = useState(false);
  const currentMap = projectMaps.find((m) => m.id === currentMapId);
  // Capture the map once when the form opens — it doesn't change while the
  // dialog is up, and the tone preview re-tints this same snapshot live.
  const [mapSnapshot] = useState<string | null>(() => getMapSnapshot?.() ?? null);
  // The Transfer destination, if one is chosen — the tile picker renders it.
  const transferMap = projectMaps.find((m) => m.id === form.transferMapId);

  return (
    <FormArea>
      <BlockTitle style={{ margin: 0 }}>
        {form.mode === 'edit' ? t('me_events_cmd_edit') : t('me_events_cmd_insert')}: {t(`me_events_cmd_${form.kind === 'selfSwitch' ? 'self_switch' : form.kind}`)}
      </BlockTitle>
      {form.kind === 'text' && (
        <Row>
          <SmallSelect value={form.textMode} onChange={(e) => setForm({ ...form, textMode: e.target.value as 'raw' | 'csv' })}>
            <option value="raw">{t('me_events_text_raw')}</option>
            <option value="csv">{t('me_events_text_csv')}</option>
          </SmallSelect>
        </Row>
      )}
      {form.kind === 'script' && <ScriptEditor value={form.text} onChange={(text) => setForm({ ...form, text })} autoFocus />}
      {(form.kind === 'comment' || (form.kind === 'text' && form.textMode === 'raw')) && (
        <FormTextArea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} autoFocus />
      )}
      {form.kind === 'text' && form.textMode === 'csv' && (
        <>
          <Row>
            <Dim>{t('me_events_text_csv_file')}</Dim>
            <SmallInput type="number" min={0} value={form.csvFile} style={{ width: 84 }} onChange={(e) => setForm({ ...form, csvFile: Number(e.target.value) || 0 })} autoFocus />
            <Dim>{t('me_events_text_csv_line')}</Dim>
            <SmallInput type="number" min={0} value={form.csvLine} onChange={(e) => setForm({ ...form, csvLine: Number(e.target.value) || 0 })} />
          </Row>
          <Dim style={{ display: 'block' }}>{resolveCsv(form.csvFile, form.csvLine) ?? t('me_events_text_csv_not_found')}</Dim>
          <Row>
            <CheckLabel>
              <input type="checkbox" checked={showTranslations} onChange={(e) => setShowTranslations(e.target.checked)} />
              {t('me_events_show_translations')}
            </CheckLabel>
          </Row>
          {showTranslations && (() => {
            const file = projectText[form.csvFile];
            const langs = file?.[0];
            const row = file?.[form.csvLine + 1];
            if (!langs || !row) return <Dim>{t('me_events_text_csv_not_found')}</Dim>;
            return (
              <div>
                {langs.map((lang, i) => (
                  <Row key={lang} style={{ marginBottom: 2 }}>
                    <Dim style={{ minWidth: 32, textTransform: 'uppercase' }}>{lang}</Dim>
                    <span>{row[i] ?? ''}</span>
                  </Row>
                ))}
              </div>
            );
          })()}
        </>
      )}
      {form.kind === 'wait' && (
        <Row>
          <Dim>{t('me_events_cmd_wait_frames')}</Dim>
          <SmallInput type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 1 })} autoFocus />
        </Row>
      )}
      {form.kind === 'switch' && (
        <Row>
          <Dim>{t('me_events_switch')}</Dim>
          <NamePicker names={systemNames.switches} value={form.id} onChange={(id) => setForm({ ...form, id })} />
          <OnOff value={form.state} onChange={(state) => setForm({ ...form, state })} />
        </Row>
      )}
      {form.kind === 'selfSwitch' && (
        <Row>
          <Dim>{t('me_events_self_switch')}</Dim>
          <SmallInput type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} autoFocus title={t('me_events_self_switch_hint')} />
          <OnOff value={form.state} onChange={(state) => setForm({ ...form, state })} />
        </Row>
      )}
      {form.kind === 'variable' && (
        <Row>
          <Dim>{t('me_events_variable')}</Dim>
          <NamePicker names={systemNames.variables} value={form.id} onChange={(id) => setForm({ ...form, id })} />
          <SmallSelect value={form.op} onChange={(e) => setForm({ ...form, op: Number(e.target.value) })}>
            {['=', '+=', '-=', '*=', '/=', '%='].map((op, i) => (
              <option key={op} value={i}>{op}</option>
            ))}
          </SmallSelect>
          <SmallInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
        </Row>
      )}
      {form.kind === 'choices' && (() => {
        const patchChoice = (i: number, partial: Partial<ChoiceEntry>) =>
          setForm({ ...form, choices: form.choices.map((c, j) => (j === i ? { ...c, ...partial } : c)) });
        return (
          <>
            {form.choices.map((choice, i) => (
              <React.Fragment key={i}>
                <Row>
                  <Dim style={{ minWidth: 58 }}>{t('me_events_choice')} {i + 1}</Dim>
                  <SmallSelect value={choice.mode} onChange={(e) => patchChoice(i, { mode: e.target.value as 'raw' | 'csv' })}>
                    <option value="raw">{t('me_events_text_raw')}</option>
                    <option value="csv">{t('me_events_text_csv')}</option>
                  </SmallSelect>
                  {choice.mode === 'raw' ? (
                    <SmallInput type="text" style={{ flex: 1, width: 'auto' }} value={choice.text} autoFocus={i === 0} onChange={(e) => patchChoice(i, { text: e.target.value })} />
                  ) : (
                    <>
                      <Dim>{t('me_events_text_csv_file')}</Dim>
                      <SmallInput type="number" min={0} style={{ width: 78 }} value={choice.csvFile} onChange={(e) => patchChoice(i, { csvFile: Number(e.target.value) || 0 })} />
                      <Dim>{t('me_events_text_csv_line')}</Dim>
                      <SmallInput type="number" min={0} value={choice.csvLine} onChange={(e) => patchChoice(i, { csvLine: Number(e.target.value) || 0 })} />
                    </>
                  )}
                  {form.choices.length > 1 && (
                    <OpBtn $danger onClick={() => setForm({ ...form, choices: form.choices.filter((_, j) => j !== i) })}>✕</OpBtn>
                  )}
                </Row>
                {choice.mode === 'csv' && (
                  <Dim style={{ display: 'block', marginLeft: 64, marginTop: -2 }}>{resolveCsv(choice.csvFile, choice.csvLine) ?? t('me_events_text_csv_not_found')}</Dim>
                )}
              </React.Fragment>
            ))}
            <Row>
              <OpBtn onClick={() => setForm({ ...form, choices: [...form.choices, emptyChoice()] })}>+ {t('me_events_add_choice')}</OpBtn>
            </Row>
            <Row>
              <Dim>{t('me_events_when_cancel')}</Dim>
              <SmallSelect value={form.cancelType} style={{ flex: 1 }} onChange={(e) => setForm({ ...form, cancelType: Number(e.target.value) })}>
                <option value={0}>{t('me_events_cancel_disallow')}</option>
                {form.choices.map((_, i) => (
                  <option key={i} value={i + 1}>{t('me_events_cancel_choice', { n: i + 1 })}</option>
                ))}
                <option value={5}>{t('me_events_cancel_branch')}</option>
              </SmallSelect>
            </Row>
          </>
        );
      })()}
      {(form.kind === 'showPicture' || form.kind === 'movePicture' || form.kind === 'erasePicture') && (
        <>
          <Row>
            <Dim style={{ minWidth: 52 }}>{t('me_events_pic_number')}</Dim>
            <SmallInput type="number" min={1} max={50} value={form.picNumber} onChange={(e) => setForm({ ...form, picNumber: clamp(Number(e.target.value) || 1, 1, 50) })} />
            <Dim>{t('me_events_pic_number_hint')}</Dim>
          </Row>
          {form.kind === 'showPicture' && (
            <PicturePicker files={pictureFiles} value={form.picName === '__undef__' ? '' : form.picName} onChange={(picName) => setForm({ ...form, picName })} />
          )}
          {form.kind === 'movePicture' && (
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_pic_duration')}</Dim>
              <SmallInput type="number" min={0} value={form.picDuration} onChange={(e) => setForm({ ...form, picDuration: Math.max(0, Number(e.target.value) || 0) })} />
              <Dim>{t('me_events_pic_frames')}</Dim>
            </Row>
          )}
          {form.kind !== 'erasePicture' && (
            <>
              <Row>
                <Dim style={{ minWidth: 52 }}>{t('me_events_pic_origin')}</Dim>
                <SmallSelect value={form.picOrigin} onChange={(e) => setForm({ ...form, picOrigin: Number(e.target.value) })}>
                  <option value={0}>{t('me_events_pic_origin_topleft')}</option>
                  <option value={1}>{t('me_events_pic_origin_center')}</option>
                </SmallSelect>
                <CheckLabel title={t('me_events_pic_by_variable_hint')}>
                  <input type="checkbox" checked={form.picByVariable} onChange={(e) => setForm({ ...form, picByVariable: e.target.checked })} />
                  {t('me_events_pic_by_variable')}
                </CheckLabel>
              </Row>
              <Row>
                <Dim style={{ minWidth: 52 }}>X</Dim>
                {form.picByVariable ? (
                  <NamePicker names={systemNames.variables} value={form.picX} onChange={(v) => setForm({ ...form, picX: v })} />
                ) : (
                  <SmallInput type="number" value={form.picX} onChange={(e) => setForm({ ...form, picX: Number(e.target.value) || 0 })} />
                )}
                <Dim>Y</Dim>
                {form.picByVariable ? (
                  <NamePicker names={systemNames.variables} value={form.picY} onChange={(v) => setForm({ ...form, picY: v })} />
                ) : (
                  <SmallInput type="number" value={form.picY} onChange={(e) => setForm({ ...form, picY: Number(e.target.value) || 0 })} />
                )}
              </Row>
              <Row>
                <Dim style={{ minWidth: 52 }}>{t('me_events_pic_zoom')}</Dim>
                <SmallInput type="number" min={0} value={form.picZoomX} onChange={(e) => setForm({ ...form, picZoomX: Math.max(0, Number(e.target.value) || 0) })} />
                <Dim>×</Dim>
                <SmallInput type="number" min={0} value={form.picZoomY} onChange={(e) => setForm({ ...form, picZoomY: Math.max(0, Number(e.target.value) || 0) })} />
                <Dim>%</Dim>
              </Row>
              <Row>
                <Dim style={{ minWidth: 52 }}>{t('me_events_pic_opacity')}</Dim>
                <SmallInput type="number" min={0} max={255} value={form.picOpacity} onChange={(e) => setForm({ ...form, picOpacity: clamp(Number(e.target.value) || 0, 0, 255) })} />
                <Dim>{t('me_events_pic_blend')}</Dim>
                <SmallSelect value={form.picBlend} onChange={(e) => setForm({ ...form, picBlend: Number(e.target.value) })}>
                  <option value={0}>{t('me_events_pic_blend_normal')}</option>
                  <option value={1}>{t('me_events_pic_blend_add')}</option>
                  <option value={2}>{t('me_events_pic_blend_sub')}</option>
                </SmallSelect>
              </Row>
            </>
          )}
        </>
      )}
      {(form.kind === 'transparent' || form.kind === 'menuAccess') && (
        <Row>
          <Dim>{form.kind === 'transparent' ? t('me_events_transparent') : t('me_events_menu_access')}</Dim>
          <SmallSelect value={form.state} onChange={(e) => setForm({ ...form, state: Number(e.target.value) })}>
            {form.kind === 'transparent' ? (
              <>
                <option value={0}>{t('me_events_on')}</option>
                <option value={1}>{t('me_events_off')}</option>
              </>
            ) : (
              <>
                <option value={0}>{t('me_events_disable')}</option>
                <option value={1}>{t('me_events_enable')}</option>
              </>
            )}
          </SmallSelect>
        </Row>
      )}
      {form.kind === 'changeGold' && (
        <Row>
          <SmallSelect value={form.goldOp} onChange={(e) => setForm({ ...form, goldOp: Number(e.target.value) })}>
            <option value={0}>{t('me_events_gold_increase')}</option>
            <option value={1}>{t('me_events_gold_decrease')}</option>
            <option value={2}>{t('me_events_gold_set')}</option>
          </SmallSelect>
          <SmallSelect value={form.goldByVariable ? 1 : 0} onChange={(e) => setForm({ ...form, goldByVariable: e.target.value === '1' })}>
            <option value={0}>{t('me_events_cond_constant')}</option>
            <option value={1}>{t('me_events_variable')}</option>
          </SmallSelect>
          {form.goldByVariable ? (
            <NamePicker names={systemNames.variables} value={form.goldValue} onChange={(v) => setForm({ ...form, goldValue: v })} />
          ) : (
            <SmallInput type="number" min={0} value={form.goldValue} onChange={(e) => setForm({ ...form, goldValue: Math.max(0, Number(e.target.value) || 0) })} />
          )}
        </Row>
      )}
      {form.kind === 'scrollMap' && (
        <Row>
          <Dim>{t('me_events_scroll_dir')}</Dim>
          <SmallSelect value={form.scrollDir} onChange={(e) => setForm({ ...form, scrollDir: Number(e.target.value) })}>
            {DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>{t(`me_events_dir_${d.key}`)}</option>
            ))}
          </SmallSelect>
          <Dim>{t('me_events_scroll_distance')}</Dim>
          <SmallInput type="number" min={0} value={form.scrollDistance} onChange={(e) => setForm({ ...form, scrollDistance: Math.max(0, Number(e.target.value) || 0) })} />
          <Dim>{t('me_events_scroll_speed')}</Dim>
          <SmallInput type="number" min={1} max={6} value={form.scrollSpeed} onChange={(e) => setForm({ ...form, scrollSpeed: clamp(Number(e.target.value) || 4, 1, 6) })} />
        </Row>
      )}
      {form.kind === 'screenShake' && (
        <Row>
          {/* RMXP's dialog caps power/speed at 9, but PSDK's shake is a plain
              linear formula (delta = power * speed / 10) with no engine cap —
              so a stronger shake than RMXP allows is both possible and safe. */}
          <Dim>{t('me_events_shake_power')}</Dim>
          <SmallInput type="number" min={0} value={form.shakePower} onChange={(e) => setForm({ ...form, shakePower: Math.max(0, Number(e.target.value) || 0) })} />
          <Dim>{t('me_events_shake_speed')}</Dim>
          <SmallInput type="number" min={0} value={form.shakeSpeed} onChange={(e) => setForm({ ...form, shakeSpeed: Math.max(0, Number(e.target.value) || 0) })} />
          <Dim>{t('me_events_shake_duration')}</Dim>
          <SmallInput type="number" min={0} value={form.shakeDuration} onChange={(e) => setForm({ ...form, shakeDuration: Math.max(0, Number(e.target.value) || 0) })} />
          <Dim>{t('me_events_pic_frames')}</Dim>
        </Row>
      )}
      {form.kind === 'screenShake' && (
        <Row style={{ alignItems: 'flex-start' }}>
          <Dim style={{ minWidth: 52, paddingTop: 4 }}>{t('me_events_shake_preview')}</Dim>
          <ShakePreview
            snapshotUrl={mapSnapshot}
            power={form.shakePower}
            speed={form.shakeSpeed}
            duration={form.shakeDuration}
            projectPath={projectPath ?? undefined}
            mapWidthTiles={mapWidthTiles}
            mapHeightTiles={mapHeightTiles}
          />
        </Row>
      )}
      {form.kind === 'weather' && (
        <>
          <Row>
            <Dim style={{ minWidth: 52 }}>{t('me_events_weather_type')}</Dim>
            <SmallSelect value={form.weatherType} onChange={(e) => setForm({ ...form, weatherType: Number(e.target.value) })}>
              <option value={0}>{t('me_events_weather_none')}</option>
              <option value={1}>{t('me_events_weather_rain')}</option>
              <option value={2}>{t('me_events_weather_sun')}</option>
              <option value={3}>{t('me_events_weather_sandstorm')}</option>
              <option value={4}>{t('me_events_weather_hail')}</option>
              <option value={5}>{t('me_events_weather_fog')}</option>
            </SmallSelect>
            <Dim>{t('me_events_weather_power')}</Dim>
            <SmallInput type="number" min={0} value={form.weatherPower} onChange={(e) => setForm({ ...form, weatherPower: Math.max(0, Number(e.target.value) || 0) })} />
            <Dim>{t('me_events_weather_duration')}</Dim>
            <SmallInput type="number" min={0} value={form.weatherDuration} onChange={(e) => setForm({ ...form, weatherDuration: Math.max(0, Number(e.target.value) || 0) })} />
            <Dim>{t('me_events_pic_frames')}</Dim>
          </Row>
          <Row style={{ alignItems: 'flex-start' }}>
            <Dim style={{ minWidth: 52, paddingTop: 4 }}>{t('me_events_weather_preview')}</Dim>
            <div style={{ flex: 1, minWidth: 0 }}>
              <WeatherPreview snapshotUrl={mapSnapshot} type={form.weatherType} power={form.weatherPower} />
            </div>
          </Row>
        </>
      )}
      {form.kind === 'changeFogOpacity' && (
        <Row>
          <Dim>{t('me_events_fog_opacity')}</Dim>
          <input type="range" min={0} max={255} value={form.fogOpacity} style={{ flex: 1, minWidth: 0 }} onChange={(e) => setForm({ ...form, fogOpacity: Number(e.target.value) })} />
          <SmallInput type="number" min={0} max={255} value={form.fogOpacity} onChange={(e) => setForm({ ...form, fogOpacity: clamp(Number(e.target.value) || 0, 0, 255) })} />
          <Dim>{t('me_events_tone_duration')}</Dim>
          <SmallInput type="number" min={0} value={form.fogOpacityDuration} onChange={(e) => setForm({ ...form, fogOpacityDuration: Math.max(0, Number(e.target.value) || 0) })} />
          <Dim>{t('me_events_pic_frames')}</Dim>
        </Row>
      )}
      {(form.kind === 'changeSaveAccess' || form.kind === 'changeEncounter') && (
        <Row>
          <Dim>{form.kind === 'changeSaveAccess' ? t('me_events_save_access') : t('me_events_encounter')}</Dim>
          <SmallSelect value={form.state} onChange={(e) => setForm({ ...form, state: Number(e.target.value) })}>
            <option value={0}>{t('me_events_disable')}</option>
            <option value={1}>{t('me_events_enable')}</option>
          </SmallSelect>
        </Row>
      )}
      {form.kind === 'controlTimer' && (
        <Row>
          <SmallSelect value={form.timerOp} onChange={(e) => setForm({ ...form, timerOp: Number(e.target.value) })}>
            <option value={0}>{t('me_events_timer_start')}</option>
            <option value={1}>{t('me_events_timer_stop')}</option>
          </SmallSelect>
          {form.timerOp === 0 && (
            <>
              <SmallInput type="number" min={0} value={form.timerSeconds} onChange={(e) => setForm({ ...form, timerSeconds: Math.max(0, Number(e.target.value) || 0) })} />
              <Dim>{t('me_events_timer_seconds')}</Dim>
            </>
          )}
        </Row>
      )}
      {form.kind === 'inputNumber' && (
        <Row>
          <Dim>{t('me_events_variable')}</Dim>
          <NamePicker names={systemNames.variables} value={form.id} onChange={(v) => setForm({ ...form, id: v })} />
          <Dim>{t('me_events_num_digits')}</Dim>
          <SmallInput type="number" min={1} max={9} value={form.numDigits} onChange={(e) => setForm({ ...form, numDigits: clamp(Number(e.target.value) || 1, 1, 9) })} />
        </Row>
      )}
      {form.kind === 'buttonInput' && (
        <Row>
          <Dim>{t('me_events_button_variable')}</Dim>
          <NamePicker names={systemNames.variables} value={form.id} onChange={(v) => setForm({ ...form, id: v })} />
        </Row>
      )}
      {form.kind === 'setEventLocation' && (
        <>
          <Row>
            <Dim>{t('me_events_move_target')}</Dim>
            <SmallSelect value={form.locTarget} onChange={(e) => setForm({ ...form, locTarget: Number(e.target.value) })}>
              <option value={-1}>{t('me_events_move_target_player')}</option>
              <option value={0}>{t('me_events_move_target_this')}</option>
              {mapEvents.map((e) => (
                <option key={e.id} value={e.id}>{`[${e.id}] ${e.name}`}</option>
              ))}
            </SmallSelect>
            <Dim>{t('me_events_loc_appoint')}</Dim>
            <SmallSelect value={form.locAppoint} onChange={(e) => setForm({ ...form, locAppoint: Number(e.target.value) })}>
              <option value={0}>{t('me_events_loc_direct')}</option>
              <option value={1}>{t('me_events_loc_variables')}</option>
              <option value={2}>{t('me_events_loc_exchange')}</option>
            </SmallSelect>
          </Row>
          <Row>
            {form.locAppoint === 2 ? (
              <>
                <Dim>{t('me_events_loc_swap_with')}</Dim>
                <SmallSelect value={form.locX} onChange={(e) => setForm({ ...form, locX: Number(e.target.value) })}>
                  <option value={0}>{t('me_events_move_target_this')}</option>
                  {mapEvents.map((e) => (
                    <option key={e.id} value={e.id}>{`[${e.id}] ${e.name}`}</option>
                  ))}
                </SmallSelect>
              </>
            ) : form.locAppoint === 1 ? (
              <>
                <Dim>X</Dim>
                <NamePicker names={systemNames.variables} value={form.locX} onChange={(v) => setForm({ ...form, locX: v })} />
                <Dim>Y</Dim>
                <NamePicker names={systemNames.variables} value={form.locY} onChange={(v) => setForm({ ...form, locY: v })} />
              </>
            ) : (
              <>
                <Dim>X</Dim>
                <SmallInput type="number" min={0} value={form.locX} onChange={(e) => setForm({ ...form, locX: Math.max(0, Number(e.target.value) || 0) })} />
                <Dim>Y</Dim>
                <SmallInput type="number" min={0} value={form.locY} onChange={(e) => setForm({ ...form, locY: Math.max(0, Number(e.target.value) || 0) })} />
                <OpBtn
                  onClick={() => currentMap && setLocPickerOpen(true)}
                  disabled={!currentMap}
                  title={currentMap ? t('me_events_transfer_pick_hint') : t('me_events_transfer_pick_needs_map')}
                >
                  {t('me_events_transfer_pick')}
                </OpBtn>
              </>
            )}
            <Dim>{t('me_events_loc_direction')}</Dim>
            <SmallSelect value={form.locDirection} onChange={(e) => setForm({ ...form, locDirection: Number(e.target.value) })}>
              <option value={0}>{t('me_events_dir_retain')}</option>
              <option value={8}>{t('me_events_dir_up')}</option>
              <option value={2}>{t('me_events_dir_down')}</option>
              <option value={4}>{t('me_events_dir_left')}</option>
              <option value={6}>{t('me_events_dir_right')}</option>
            </SmallSelect>
          </Row>
        </>
      )}
      {form.kind === 'exitEvent' && (
        <Row>
          <Dim>{t('me_events_hint_exitEvent')}</Dim>
        </Row>
      )}
      {(form.kind === 'tintScreen' || form.kind === 'fogTone' || form.kind === 'pictureTone' || form.kind === 'screenFlash') && (() => {
        // A Flash is an additive color (0..255) blended by its strength; a Tone
        // shifts toward gray then adds its RGB (which may be negative to darken).
        const isFlash = form.kind === 'screenFlash';
        const rgbMin = isFlash ? 0 : -255;
        const cl = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
        const channels: { key: 'toneRed' | 'toneGreen' | 'toneBlue' | 'toneGray'; label: string; min: number }[] = [
          { key: 'toneRed', label: t('me_events_tone_red'), min: rgbMin },
          { key: 'toneGreen', label: t('me_events_tone_green'), min: rgbMin },
          { key: 'toneBlue', label: t('me_events_tone_blue'), min: rgbMin },
          { key: 'toneGray', label: isFlash ? t('me_events_tone_strength') : t('me_events_tone_gray'), min: 0 },
        ];
        // Approximate how the tone/flash looks over a few scene-like samples, so
        // the effect is visible before it ever runs — a "better RMXP" nicety.
        const px = (r: number, g: number, b: number): string => {
          if (isFlash) {
            const a = cl(form.toneGray, 0, 255) / 255;
            const m = (c: number, t2: number) => Math.round(c * (1 - a) + cl(t2, 0, 255) * a);
            return `rgb(${m(r, form.toneRed)}, ${m(g, form.toneGreen)}, ${m(b, form.toneBlue)})`;
          }
          const gr = cl(form.toneGray, 0, 255) / 255;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const m = (c: number, tn: number) => Math.round(cl(c + (lum - c) * gr + tn, 0, 255));
          return `rgb(${m(r, form.toneRed)}, ${m(g, form.toneGreen)}, ${m(b, form.toneBlue)})`;
        };
        const samples: [number, number, number][] = [
          [210, 180, 150],
          [110, 165, 95],
          [120, 165, 220],
          [235, 235, 235],
        ];
        return (
          <>
            {form.kind === 'pictureTone' && (
              <Row>
                <Dim style={{ minWidth: 52 }}>{t('me_events_pic_number')}</Dim>
                <SmallInput type="number" min={1} max={50} value={form.picNumber} onChange={(e) => setForm({ ...form, picNumber: clamp(Number(e.target.value) || 1, 1, 50) })} />
                <Dim>{t('me_events_pic_number_hint')}</Dim>
              </Row>
            )}
            {channels.map((ch) => (
              <Row key={ch.key}>
                <Dim style={{ minWidth: 52 }}>{ch.label}</Dim>
                <input
                  type="range"
                  min={ch.min}
                  max={255}
                  value={form[ch.key]}
                  style={{ flex: 1, minWidth: 0 }}
                  onChange={(e) => setForm({ ...form, [ch.key]: Number(e.target.value) })}
                />
                <SmallInput
                  type="number"
                  min={ch.min}
                  max={255}
                  value={form[ch.key]}
                  onChange={(e) => setForm({ ...form, [ch.key]: cl(Number(e.target.value) || 0, ch.min, 255) })}
                />
              </Row>
            ))}
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_tone_duration')}</Dim>
              <SmallInput type="number" min={0} value={form.toneDuration} onChange={(e) => setForm({ ...form, toneDuration: Math.max(0, Number(e.target.value) || 0) })} />
              <Dim>{t('me_events_pic_frames')}</Dim>
            </Row>
            <Row style={{ alignItems: 'flex-start' }}>
              <Dim style={{ minWidth: 52, paddingTop: 4 }}>{t('me_events_tone_preview')}</Dim>
              {mapSnapshot ? (
                // The real map, tinted live. Swatches stay as a fallback below
                // only when no snapshot could be captured.
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TonePreview snapshotUrl={mapSnapshot} red={form.toneRed} green={form.toneGreen} blue={form.toneBlue} fourth={form.toneGray} isFlash={isFlash} />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {samples.map((s, i) => (
                    <div key={i} style={{ flex: 1, height: 28, borderRadius: 4, background: px(s[0], s[1], s[2]), border: '1px solid rgba(0,0,0,0.25)' }} />
                  ))}
                </div>
              )}
            </Row>
          </>
        );
      })()}
      {form.kind === 'executeTransition' && (
        <Row>
          <Dim>{t('me_events_transition_name')}</Dim>
          <SmallInput type="text" style={{ flex: 1, width: 'auto' }} value={form.text} placeholder={t('me_events_transition_default')} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        </Row>
      )}
      {(form.kind === 'eraseEvent' || form.kind === 'returnToTitle' || form.kind === 'prepareTransition') && <Dim>{t(`me_events_hint_${form.kind}`)}</Dim>}
      {form.kind === 'waitMove' && (() => {
        // Encodes the target as a select value: all / self / player / an id.
        const value = form.waitAll ? 'all' : form.waitTarget < 0 ? 'self' : form.waitTarget === 0 ? 'player' : String(form.waitTarget);
        const apply = (v: string) => {
          if (v === 'all') return setForm({ ...form, waitAll: true });
          if (v === 'self') return setForm({ ...form, waitAll: false, waitTarget: -1 });
          if (v === 'player') return setForm({ ...form, waitAll: false, waitTarget: 0 });
          setForm({ ...form, waitAll: false, waitTarget: Number(v) });
        };
        return (
          <Row>
            <Dim>{t('me_events_wait_for')}</Dim>
            <SmallSelect style={{ flex: 1 }} value={value} onChange={(e) => apply(e.target.value)} title={t('me_events_wait_hint')}>
              <option value="all">{t('me_events_wait_all')}</option>
              <option value="self">{t('me_events_wait_this')}</option>
              <option value="player">{t('me_events_wait_player')}</option>
              {mapEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{`[${ev.id}] ${ev.name}`}</option>
              ))}
            </SmallSelect>
          </Row>
        );
      })()}
      {form.kind === 'commonEvent' && (
        <>
          <Row>
            <Dim>{t('me_events_common_event')}</Dim>
            <SmallSelect style={{ flex: 1 }} value={form.commonEventId} onChange={(e) => setForm({ ...form, commonEventId: Number(e.target.value) })}>
              <option value={0}>{t('me_events_common_event_pick')}</option>
              {commonEvents.map(({ id, name }) => (
                // An unnamed common event is still real and callable — label it
                // rather than showing a bare id with nothing after it.
                <option key={id} value={id}>{`[${id}] ${name || t('me_events_common_event_unnamed')}`}</option>
              ))}
            </SmallSelect>
          </Row>
          {onEditCommonEvents && (
            <Row>
              <OpBtn onClick={onEditCommonEvents}>{t('me_events_edit_common_events')}</OpBtn>
            </Row>
          )}
        </>
      )}
      {form.kind === 'transfer' && (
        <>
          <Row>
            <CheckLabel title={t('me_events_transfer_by_variable_hint')}>
              <input
                type="checkbox"
                checked={form.transferByVariable}
                onChange={(e) => setForm({ ...form, transferByVariable: e.target.checked })}
              />
              {t('me_events_transfer_by_variable')}
            </CheckLabel>
          </Row>
          {form.transferByVariable ? (
            // The three values are VARIABLE IDS read at runtime, not literals.
            <>
              <Row>
                <Dim style={{ minWidth: 40 }}>{t('me_events_transfer_map')}</Dim>
                <NamePicker names={systemNames.variables} value={form.transferMapId} onChange={(v) => setForm({ ...form, transferMapId: v })} />
              </Row>
              <Row>
                <Dim style={{ minWidth: 40 }}>X</Dim>
                <NamePicker names={systemNames.variables} value={form.transferX} onChange={(v) => setForm({ ...form, transferX: v })} />
              </Row>
              <Row>
                <Dim style={{ minWidth: 40 }}>Y</Dim>
                <NamePicker names={systemNames.variables} value={form.transferY} onChange={(v) => setForm({ ...form, transferY: v })} />
              </Row>
            </>
          ) : (
            <>
              <Row>
                <Dim style={{ minWidth: 40 }}>{t('me_events_transfer_map')}</Dim>
                <SmallSelect style={{ flex: 1 }} value={form.transferMapId} onChange={(e) => setForm({ ...form, transferMapId: Number(e.target.value) })}>
                  <option value={0}>{t('me_events_transfer_map_pick')}</option>
                  {projectMaps.map(({ id, name }) => (
                    <option key={id} value={id}>{`[${id}] ${name}`}</option>
                  ))}
                </SmallSelect>
              </Row>
              <Row>
                <Dim style={{ minWidth: 40 }}>X</Dim>
                <SmallInput type="number" min={0} value={form.transferX} onChange={(e) => setForm({ ...form, transferX: Math.max(0, Number(e.target.value) || 0) })} />
                <Dim>Y</Dim>
                <SmallInput type="number" min={0} value={form.transferY} onChange={(e) => setForm({ ...form, transferY: Math.max(0, Number(e.target.value) || 0) })} />
                {/* Needs a destination before there's a map to draw. */}
                <OpBtn
                  onClick={() => setTilePickerOpen(true)}
                  disabled={!transferMap}
                  title={transferMap ? t('me_events_transfer_pick_hint') : t('me_events_transfer_pick_needs_map')}
                >
                  {t('me_events_transfer_pick')}
                </OpBtn>
              </Row>
            </>
          )}
          <Row>
            <Dim style={{ minWidth: 40 }}>{t('me_events_transfer_direction')}</Dim>
            <SmallSelect value={form.transferDirection} onChange={(e) => setForm({ ...form, transferDirection: Number(e.target.value) })}>
              <option value={0}>{t('me_events_transfer_direction_keep')}</option>
              {DIRECTIONS.map((d) => (
                <option key={d.value} value={d.value}>{t(`me_events_dir_${d.key}`)}</option>
              ))}
            </SmallSelect>
            <Dim>{t('me_events_transfer_fade')}</Dim>
            <SmallSelect value={form.transferFade} onChange={(e) => setForm({ ...form, transferFade: Number(e.target.value) })}>
              <option value={0}>{t('me_events_transfer_fade_yes')}</option>
              <option value={1}>{t('me_events_transfer_fade_no')}</option>
            </SmallSelect>
          </Row>
        </>
      )}
      {isAudioKind(form.kind) && (
        <AudioPicker
          files={audioFiles}
          folder={AUDIO_KINDS[form.kind].folder}
          // '__undef__' is the form's "nothing chosen"; the picker speaks ''.
          value={form.audioName === '__undef__' ? '' : form.audioName}
          volume={form.audioVolume}
          pitch={form.audioPitch}
          onChange={(audioName) => setForm({ ...form, audioName })}
          onVolumeChange={(audioVolume) => setForm({ ...form, audioVolume })}
          onPitchChange={(audioPitch) => setForm({ ...form, audioPitch })}
        />
      )}
      {(form.kind === 'fadeBgm' || form.kind === 'fadeBgs') && (
        <Row>
          <Dim>{t('me_events_audio_fade')}</Dim>
          <SmallInput type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Math.max(1, Number(e.target.value) || 1) })} />
          <Dim>{t('me_events_audio_seconds')}</Dim>
        </Row>
      )}
      {(form.kind === 'stopSe' || form.kind === 'memorizeBgm' || form.kind === 'restoreBgm') && <Dim>{t(`me_events_hint_${form.kind}`)}</Dim>}
      {form.kind === 'conditional' && (() => {
        const patchCond = (i: number, partial: Partial<CondEntry>) =>
          setForm({ ...form, conds: form.conds.map((c, j) => (j === i ? { ...c, ...partial } : c)) });
        return (
          <>
            {form.conds.map((cond, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <Row>
                    <SmallSelect
                      value={form.condJoin}
                      style={{ width: 72 }}
                      title={t('me_events_cond_join_hint')}
                      onChange={(e) => setForm({ ...form, condJoin: e.target.value as 'and' | 'or' })}
                    >
                      <option value="and">{t('me_events_cond_and')}</option>
                      <option value="or">{t('me_events_cond_or')}</option>
                    </SmallSelect>
                  </Row>
                )}
                <Row>
                  <SmallSelect value={cond.type} onChange={(e) => patchCond(i, { type: Number(e.target.value) })}>
                    <option value={0}>{t('me_events_switch')}</option>
                    <option value={1}>{t('me_events_variable')}</option>
                    <option value={2}>{t('me_events_self_switch')}</option>
                    <option value={12}>{t('me_events_cmd_script')}</option>
                  </SmallSelect>
                  {cond.type === 0 && (
                    <>
                      <NamePicker names={systemNames.switches} value={cond.id} onChange={(id) => patchCond(i, { id })} />
                      <Dim>{t('me_events_is')}</Dim>
                      <OnOff value={cond.state} onChange={(state) => patchCond(i, { state })} />
                    </>
                  )}
                  {cond.type === 1 && (
                    <>
                      <NamePicker names={systemNames.variables} value={cond.id} onChange={(id) => patchCond(i, { id })} />
                      <SmallSelect value={cond.op} onChange={(e) => patchCond(i, { op: Number(e.target.value) })}>
                        {VAR_OPS.map((op, oi) => (
                          <option key={op} value={oi}>{op}</option>
                        ))}
                      </SmallSelect>
                      <SmallSelect value={cond.operandType} onChange={(e) => patchCond(i, { operandType: Number(e.target.value) })}>
                        <option value={0}>{t('me_events_cond_constant')}</option>
                        <option value={1}>{t('me_events_variable')}</option>
                      </SmallSelect>
                      {cond.operandType === 0 ? (
                        <SmallInput type="number" value={cond.amount} onChange={(e) => patchCond(i, { amount: Number(e.target.value) || 0 })} />
                      ) : (
                        <NamePicker names={systemNames.variables} value={cond.amount} onChange={(v) => patchCond(i, { amount: v })} />
                      )}
                    </>
                  )}
                  {cond.type === 2 && (
                    <>
                      <SmallInput type="text" style={{ width: 48 }} value={cond.key} onChange={(e) => patchCond(i, { key: e.target.value })} title={t('me_events_self_switch_hint')} />
                      <Dim>{t('me_events_is')}</Dim>
                      <OnOff value={cond.state} onChange={(state) => patchCond(i, { state })} />
                    </>
                  )}
                  {form.conds.length > 1 && (
                    <OpBtn $danger onClick={() => setForm({ ...form, conds: form.conds.filter((_, j) => j !== i) })}>✕</OpBtn>
                  )}
                </Row>
                {cond.type === 12 && <ScriptEditor value={cond.text} onChange={(text) => patchCond(i, { text })} autoFocus={i === 0} />}
              </React.Fragment>
            ))}
            <Row>
              <OpBtn onClick={() => setForm({ ...form, conds: [...form.conds, emptyCond()] })}>+ {t('me_events_add_condition')}</OpBtn>
            </Row>
            <Row>
              <CheckLabel>
                <input type="checkbox" checked={form.condElse} onChange={(e) => setForm({ ...form, condElse: e.target.checked })} />
                {t('me_events_cond_else')}
              </CheckLabel>
            </Row>
          </>
        );
      })()}
      {form.kind === 'loop' && <Dim>{t('me_events_loop_hint')}</Dim>}
      {form.kind === 'break' && <Dim>{t('me_events_break_hint')}</Dim>}
      {form.kind === 'label' && (
        <Row>
          <Dim>{t('me_events_label_name')}</Dim>
          <SmallInput type="text" style={{ flex: 1, width: 'auto' }} value={form.text} autoFocus onChange={(e) => setForm({ ...form, text: e.target.value })} />
        </Row>
      )}
      {form.kind === 'jump' &&
        (pageLabels.length === 0 ? (
          <Dim>{t('me_events_no_labels')}</Dim>
        ) : (
          <Row>
            <Dim>{t('me_events_jump_to')}</Dim>
            <SmallSelect style={{ flex: 1 }} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}>
              {pageLabels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </SmallSelect>
          </Row>
        ))}
      {form.kind === 'item' && (
        <>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_item_mode')}</Dim>
            <SmallSelect value={form.itemMode} onChange={(e) => setForm({ ...form, itemMode: e.target.value as 'add' | 'pick' | 'give' })}>
              <option value="add">{t('me_events_item_add')}</option>
              <option value="pick">{t('me_events_item_pick')}</option>
              <option value="give">{t('me_events_item_give')}</option>
            </SmallSelect>
          </Row>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_item')}</Dim>
            <SelectField>
              <SelectItem dbSymbol={form.itemSymbol} noLabel undefValueOption={t('me_events_choose')} onChange={(v) => setForm({ ...form, itemSymbol: v })} />
            </SelectField>
          </Row>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_count')}</Dim>
            <SmallInput type="number" min={1} value={form.count} onChange={(e) => setForm({ ...form, count: Math.max(1, Number(e.target.value) || 1) })} />
          </Row>
          {/* give_item never deletes the event, so no toggle there. */}
          {form.itemMode !== 'give' && (
            <Row>
              <CheckLabel title={t('me_events_delete_event_hint')}>
                <input type="checkbox" checked={form.deleteEvent} onChange={(e) => setForm({ ...form, deleteEvent: e.target.checked })} />
                {t('me_events_delete_event_after')}
              </CheckLabel>
            </Row>
          )}
          <Dim style={{ display: 'block' }}>{t(`me_events_item_hint_${form.itemMode}`)}</Dim>
        </>
      )}
      {form.kind === 'creature' && (
        <>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_species')}</Dim>
            <SelectField>
              <SelectPokemon dbSymbol={form.species} noLabel undefValueOption={t('me_events_choose')} onChange={(v) => setForm({ ...form, species: v })} />
            </SelectField>
          </Row>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_level')}</Dim>
            <SmallInput
              type="number"
              min={1}
              max={100}
              style={{ width: 52 }}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: clamp(Number(e.target.value) || 1, 1, 100) })}
            />
            <CheckLabel>
              <input type="checkbox" checked={form.shiny} onChange={(e) => setForm({ ...form, shiny: e.target.checked })} />
              {t('me_events_shiny')}
            </CheckLabel>
            <Dim>{t('me_events_nickname')}</Dim>
            <SmallInput
              type="text"
              style={{ flex: 1, width: 'auto', minWidth: 90 }}
              value={form.nickname}
              placeholder={t('me_events_nickname_ph')}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </Row>
          <Row>
            <Dim style={{ minWidth: 64 }}>{t('me_events_nature')}</Dim>
            <SelectField>
              <SelectNature dbSymbol={form.nature} noneValue overwriteNoneValue={t('me_events_nature_default')} onChange={(selected) => setForm({ ...form, nature: selected.value })} />
            </SelectField>
          </Row>
          <CmdGroupTitle>{t('me_events_moves')}</CmdGroupTitle>
          <MoveGrid>
            {form.moves.map((mv, i) => (
              <SelectField key={i} title={t('me_events_move_n', { n: i + 1 })}>
                <SelectMove dbSymbol={mv} noLabel undefValueOption={t('me_events_move_default')} onChange={(v) => setForm({ ...form, moves: form.moves.map((m, j) => (j === i ? v : m)) })} />
              </SelectField>
            ))}
          </MoveGrid>
          <Row>
            <CheckLabel>
              <input type="checkbox" checked={form.customIvs} onChange={(e) => setForm({ ...form, customIvs: e.target.checked })} />
              {t('me_events_custom_ivs')}
            </CheckLabel>
            <CheckLabel style={{ marginLeft: 10 }}>
              <input type="checkbox" checked={form.customEvs} onChange={(e) => setForm({ ...form, customEvs: e.target.checked })} />
              {t('me_events_custom_evs')}
            </CheckLabel>
          </Row>
          {form.customIvs && (
            <Row>
              {STAT_KEYS.map((key, i) => (
                <React.Fragment key={key}>
                  <Dim>{t(`me_events_stat_${key}`)}</Dim>
                  <SmallInput
                    style={{ width: 46 }}
                    type="number"
                    min={0}
                    max={31}
                    value={form.ivs[i]}
                    onChange={(e) => setForm({ ...form, ivs: form.ivs.map((v, j) => (j === i ? clamp(Number(e.target.value) || 0, 0, 31) : v)) })}
                  />
                </React.Fragment>
              ))}
            </Row>
          )}
          {form.customEvs && (
            <Row>
              {STAT_KEYS.map((key, i) => (
                <React.Fragment key={key}>
                  <Dim>{t(`me_events_stat_${key}`)}</Dim>
                  <SmallInput
                    style={{ width: 52 }}
                    type="number"
                    min={0}
                    max={252}
                    value={form.evs[i]}
                    onChange={(e) => setForm({ ...form, evs: form.evs.map((v, j) => (j === i ? clamp(Number(e.target.value) || 0, 0, 252) : v)) })}
                  />
                </React.Fragment>
              ))}
            </Row>
          )}
        </>
      )}
      <Row>
        <OpBtn onClick={onSubmit} disabled={!canSubmitForm(form)}>{t('me_events_ok')}</OpBtn>
        <OpBtn onClick={onCancel}>{t('me_events_cancel')}</OpBtn>
      </Row>
      {tilePickerOpen && transferMap && (
        <MapTilePicker
          tiledFilename={transferMap.tiledFilename}
          mapName={`[${transferMap.id}] ${transferMap.name}`}
          x={form.transferX}
          y={form.transferY}
          onConfirm={(transferX, transferY) => {
            setForm({ ...form, transferX, transferY });
            setTilePickerOpen(false);
          }}
          onClose={() => setTilePickerOpen(false)}
        />
      )}
      {locPickerOpen && currentMap && (
        <MapTilePicker
          tiledFilename={currentMap.tiledFilename}
          mapName={`[${currentMap.id}] ${currentMap.name}`}
          x={form.locX}
          y={form.locY}
          onConfirm={(locX, locY) => {
            setForm({ ...form, locX, locY });
            setLocPickerOpen(false);
          }}
          onClose={() => setLocPickerOpen(false)}
        />
      )}
    </FormArea>
  );
};
