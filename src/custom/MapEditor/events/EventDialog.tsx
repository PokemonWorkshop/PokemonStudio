import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Toggle } from '@components/inputs';
import { playSound } from '@utils/sound';
import type { MapEvent, MapEventPage } from './useMapEvents';
import {
  composeEventName,
  createEmptyPage,
  DIRECTIONS,
  getZTag,
  hasShadowlessTag,
  MOVE_FREQS,
  MOVE_SPEEDS,
  MOVE_TYPES,
  CUSTOM_MOVE_TYPE,
  setShadowlessTag,
  setZTag,
  stripNameTags,
  TRIGGERS,
  buildTextChain,
  type WorkingCommand,
} from './rmxpEventUtils';
import { buildBerryTreeScript, buildBerryInteractionTree } from './dialog/commandModel';
import { AnimatedCharacterPreview, CharacterSprite } from './CharacterSprite';
import {
  Block,
  BlockTitle,
  Body,
  CaretBtn,
  CheckLabel,
  Dialog,
  DIALOG_BODY_ATTR,
  Dim,
  FieldCol,
  FieldLabel,
  Footer,
  FooterBtn,
  GraphicPreview,
  Header,
  IconBtn,
  LeftColumn,
  NameInput,
  OpBtn,
  PageOps,
  PasteMenu,
  PasteMenuItem,
  PasteWrap,
  PickerCell,
  PickerGrid,
  RightColumn,
  Row,
  Scrim,
  SearchInput,
  SideBySide,
  SmallInput,
  SmallSelect,
  Tab,
  TabsRow,
  TitleBar,
} from './dialog/styles';
import { ConditionsBlock } from './dialog/ConditionsBlock';
import { MoveRouteDialog } from './dialog/MoveRouteDialog';
import type { AudioFile } from './dialog/AudioPicker';
import { useEventDraft } from './dialog/useEventDraft';
import { CommandListEditor } from './CommandListEditor';
import { CommonEventsDialog } from './CommonEventsDialog';

/**
 * Fork-only event editor dialog — RPG Maker XP's "Edit Event" window,
 * 1:1 layout, restyled for Studio. Opened by double-clicking an event in
 * the map tab's Events mode.
 *
 * Command editing (this phase): insert/edit/delete/reorder of "plain"
 * commands (text, comment, script, wait, switches, variables, self switch).
 * Branch-structural commands (choices, conditional branches, loops, battle
 * results) are rendered read-only anchors — they and any command we don't
 * edit round-trip byte-faithfully via the keep-protocol in writeRMXPEvents.
 */

// --- component -----------------------------------------------------------------

type Props = {
  event: MapEvent;
  /** Every event on the map — the Set Move Route target dropdown lists them. */
  mapEvents: { id: number; name: string }[];
  onSave: (event: MapEvent) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  /** Capture a PNG data URL of the current map, for the tone command's on-map preview. */
  getMapSnapshot?: () => string | null;
  /** The id of the map being edited — a new Transfer Player defaults to it. */
  currentMapId?: number;
  /** Map size in tiles — frames the shake command's in-game preview. */
  mapWidthTiles?: number;
  mapHeightTiles?: number;
};

// Page clipboard lives at module scope so a page copied in one event can be
// pasted into ANOTHER event (its provenance carries the command list over).
let pageClipboardShared: MapEventPage | null = null;
// Command clipboard (module scope: paste across pages/events). Entries are
// stored WITHOUT __keep provenance — pasted commands are always fresh, so
// only plain-param chains (the editable set) are copyable.
let commandClipboardShared: WorkingCommand[] | null = null;

/**
 * A fresh, never-configured event: exactly one page whose command list holds
 * nothing but the code-0 terminator and which has no character graphic set.
 * That's the common "just created the event" case we can safely replace; any
 * real content makes us append the scaffold instead of clobbering it.
 */
const isFreshSinglePage = (ev: MapEvent): boolean => {
  if (ev.pages.length !== 1) return false;
  const p = ev.pages[0];
  const hasCommands = p.list.some((c) => c.code !== 0);
  return !hasCommands && !p.graphic.characterName;
};

export const EventDialog = ({ event, mapEvents, onSave, onDelete, onClose, getMapSnapshot, currentMapId, mapWidthTiles, mapHeightTiles }: Props) => {
  const { t } = useTranslation();
  const [{ projectPath, projectData }] = useGlobalState();
  const { draft, commitDraft, undo, redo, canUndo, canRedo } = useEventDraft(event);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageClipboard, setPageClipboard] = useState<MapEventPage | null>(pageClipboardShared);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [characterFiles, setCharacterFiles] = useState<string[]>([]);
  const [graphicSearch, setGraphicSearch] = useState('');
  // Defer filtering so typing in the search box stays responsive with big folders.
  const deferredGraphicSearch = React.useDeferredValue(graphicSearch);
  const [hoveredGraphic, setHoveredGraphic] = useState<string | null>(null);
  const [animatePreview, setAnimatePreview] = useState(false);
  // The command-list editor (right column) is the shared CommandListEditor.
  const [commonEventsOpen, setCommonEventsOpen] = useState(false);
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
  const [pasteMenuOpen, setPasteMenuOpen] = useState(false);
  const [moveRouteOpen, setMoveRouteOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const preExpandSize = useRef<{ width: string; height: string } | null>(null);
  const toggleExpand = () => {
    const el = dialogRef.current;
    if (!el) return;
    if (!expanded) {
      // Remember the current (possibly hand-resized) size so restore is exact.
      preExpandSize.current = { width: el.style.width, height: el.style.height };
      el.style.width = 'calc(100vw - 32px)';
      el.style.height = 'calc(100vh - 32px)';
      setExpanded(true);
      playSound('sparkle');
    } else {
      el.style.width = preExpandSize.current?.width ?? '';
      el.style.height = preExpandSize.current?.height ?? '';
      setExpanded(false);
      playSound('droplet');
    }
  };
  // Switch/variable NAMES from Data/System.rxdata for the condition pickers.
  const [systemNames, setSystemNames] = useState<{ switches: string[]; variables: string[] }>({ switches: [], variables: [] });
  useEffect(() => {
    if (!projectPath) return;
    window.api.readRMXPSwitchNames(
      { projectPath },
      (output) => setSystemNames({ switches: output.switches ?? [], variables: output.variables ?? [] }),
      () => setSystemNames({ switches: [], variables: [] }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectPath]);

  const page = draft.pages[pageIndex] ?? draft.pages[0];

  useEffect(() => {
    if (!pickerOpen || !projectPath || characterFiles.length > 0) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/graphics/characters`, extensions: ['.png', '.gif'], isFileNameOnly: true },
      ({ filePaths }) => setCharacterFiles(filePaths.map((f) => f.replace(/^.*[\\/]/, ''))),
      () => setCharacterFiles([]),
    );
  }, [pickerOpen, projectPath, characterFiles.length]);

  // Audio files for the PAGE move route's Play SE (Audio/se). The command-list
  // editor loads its own audio for command audio/route forms.
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  useEffect(() => {
    if (!projectPath || !moveRouteOpen) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/Audio/se`, extensions: ['.ogg', '.mp3', '.wav', '.mid', '.flac'], isFileNameOnly: true },
      ({ filePaths }) =>
        setAudioFiles(
          filePaths
            .map((f) => f.replace(/^.*[\\/]/, ''))
            .map((file) => ({ file, name: file.replace(/\.[^.]+$/, '') }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      () => setAudioFiles([]),
    );
  }, [projectPath, moveRouteOpen]);

  const patchPage = useCallback(
    (partial: Partial<MapEventPage>) => {
      commitDraft((prev) => ({ ...prev, pages: prev.pages.map((p, i) => (i === pageIndex ? { ...p, ...partial } : p)) }));
    },
    [pageIndex],
  );

  const patchCondition = useCallback(
    (partial: Partial<MapEventPage['condition']>) => patchPage({ condition: { ...page.condition, ...partial } }),
    [patchPage, page],
  );

  const patchGraphic = useCallback(
    (partial: Partial<MapEventPage['graphic']>) => patchPage({ graphic: { ...page.graphic, ...partial } }),
    [patchPage, page],
  );

  // --- page ops --------------------------------------------------------------
  const addPage = () => {
    commitDraft((prev) => ({ ...prev, pages: [...prev.pages, createEmptyPage()] }));
    setPageIndex(draft.pages.length);
  };
  const copyPage = () => {
    const copy = { ...page, list: [...page.list] };
    pageClipboardShared = copy;
    setPageClipboard(copy);
  };
  const pastePage = (where: 'this' | 'before' | 'after' = 'after') => {
    const clip = pageClipboardShared ?? pageClipboard;
    setPasteMenuOpen(false);
    if (!clip) return;
    const fresh = { ...clip, list: [...clip.list] };
    commitDraft((prev) => {
      const pages = [...prev.pages];
      if (where === 'this') {
        pages[pageIndex] = fresh;
      } else {
        pages.splice(where === 'before' ? pageIndex : pageIndex + 1, 0, fresh);
      }
      return { ...prev, pages };
    });
    // Select the page we just wrote so the user lands on it.
    if (where === 'after') setPageIndex(pageIndex + 1);
    else setPageIndex(pageIndex);
  };
  const deletePage = () => {
    if (draft.pages.length <= 1) return;
    commitDraft((prev) => ({ ...prev, pages: prev.pages.filter((_, i) => i !== pageIndex) }));
    setPageIndex((i) => Math.max(0, i - 1));
  };
  const clearPage = () => {
    commitDraft((prev) => ({ ...prev, pages: prev.pages.map((p, i) => (i === pageIndex ? createEmptyPage() : p)) }));
  };
  /** Reorder pages by drag: move page `from` to land BEFORE tab `to`. */
  const reorderPages = (from: number, to: number) => {
    if (from === to || from + 1 === to) return;
    const pages = [...draft.pages];
    const viewed = pages[pageIndex]; // keep the viewed page selected after the move
    const [moved] = pages.splice(from, 1);
    pages.splice(from < to ? to - 1 : to, 0, moved);
    commitDraft((prev) => ({ ...prev, pages }));
    const newIndex = pages.indexOf(viewed);
    if (newIndex >= 0) setPageIndex(newIndex);
  };

  // --- Set up Berry Tree scaffold --------------------------------------------
  // The berry's own event charset (the graphicName we store on berry data), or
  // '' when it has none — in which case we keep createEmptyPage's blank graphic.
  const berryGraphicName = (dbSymbol: string): string => projectData.items[dbSymbol]?.berryData?.graphicName || '';

  /**
   * Build the two scaffold pages. Both carry the tree charset and idle-animate
   * (isStepAnime — berry-tree-only, not the global page default).
   *
   * Page 1 (autorun, trigger 3): plants the tree via the same `berry_tree(...)`
   * 355 script the command emits, then flips Self Switch A ON (123, ['A', 0] —
   * 0 = ON), then the code-0 terminator.
   * Page 2 (action button, trigger 0): gated on Self Switch A, same graphic,
   * optionally the editable Berry Tree Interaction if/else tree at indent 0,
   * always ending on the code-0 terminator.
   */
  const buildScaffoldPages = (dbSymbol: string, stage: number, includeInteraction: boolean): [MapEventPage, MapEventPage] => {
    const name = berryGraphicName(dbSymbol);
    const graphic = { ...createEmptyPage().graphic, ...(name ? { characterName: name } : {}) };
    const page1: MapEventPage = {
      ...createEmptyPage(),
      trigger: 3,
      isStepAnime: true,
      graphic: { ...graphic },
      list: [
        ...buildTextChain(355, buildBerryTreeScript(dbSymbol, stage), 0),
        { code: 123, indent: 0, parameters: ['A', 0] },
        { code: 0, indent: 0, parameters: [] },
      ],
    };
    const page2: MapEventPage = {
      ...createEmptyPage(),
      trigger: 0,
      isStepAnime: true,
      graphic: { ...graphic },
      condition: { ...createEmptyPage().condition, isSelfSwitch: true, selfSwitch: 'A' },
      list: includeInteraction
        ? [...buildBerryInteractionTree(0), { code: 0, indent: 0, parameters: [] }]
        : [{ code: 0, indent: 0, parameters: [] }],
    };
    return [page1, page2];
  };

  /**
   * Scaffold the two berry-tree pages onto THIS event. Passed to the command
   * list editor and fired when the user inserts a Create Berry Tree command
   * (map-event editor only) — see CommandListEditor.submitForm.
   */
  const applyBerryTreeSetup = (dbSymbol: string, stage: number, includeInteraction: boolean) => {
    if (!dbSymbol || dbSymbol === '__undef__') return;
    const [page1, page2] = buildScaffoldPages(dbSymbol, stage, includeInteraction);
    // Fresh empty event: replace it. Anything with real content: append the two
    // pages rather than clobber the user's work (non-destructive by design).
    const fresh = isFreshSinglePage(draft);
    commitDraft((prev) => ({ ...prev, pages: fresh ? [page1, page2] : [...prev.pages, page1, page2] }));
    setPageIndex(fresh ? 0 : draft.pages.length);
  };

  // The command list itself is edited by the shared CommandListEditor below.
  const setList = (list: WorkingCommand[]) => patchPage({ list } as Partial<MapEventPage>);

  // Page-level undo/redo. Command copy/paste/delete keys live in CommandListEditor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <Scrim onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Dialog ref={dialogRef}>
        <TitleBar>
          <span>{t('me_events_edit_event')} — ID:{`${draft.id}`.padStart(3, '0')}</span>
          <span style={{ flex: 1 }} />
          <IconBtn onClick={undo} disabled={!canUndo} title={`${t('me_events_undo')} (Ctrl+Z)`}>↶</IconBtn>
          <IconBtn onClick={redo} disabled={!canRedo} title={`${t('me_events_redo')} (Ctrl+Y)`}>↷</IconBtn>
          <IconBtn onClick={toggleExpand} title={t(expanded ? 'me_events_restore_window' : 'me_events_expand_window')}>
            {expanded ? '🗗' : '⛶'}
          </IconBtn>
        </TitleBar>

        <Header>
          <FieldCol>
            <FieldLabel>{t('me_events_name')}</FieldLabel>
            {/* Show the user-facing name only — the § / [z=N] tags are hidden
                and re-attached from the checkbox + Z field on every edit. */}
            <NameInput
              value={stripNameTags(draft.name)}
              onChange={(e) =>
                commitDraft((prev) => ({ ...prev, name: composeEventName(e.target.value, hasShadowlessTag(prev.name), getZTag(prev.name)) }))
              }
            />
          </FieldCol>
          <FieldCol title={t('me_events_shadowless_hint')}>
            <FieldLabel>{t('me_events_shadowless')}</FieldLabel>
            <CheckLabel style={{ height: 28 }}>
              <Toggle
                checked={hasShadowlessTag(draft.name)}
                onChange={(e) => commitDraft((prev) => ({ ...prev, name: setShadowlessTag(prev.name, e.target.checked) }))}
              />
            </CheckLabel>
          </FieldCol>
          <FieldCol title={t('me_events_z_hint')}>
            <FieldLabel>{t('me_events_z_level')}</FieldLabel>
            <SmallInput
              type="number"
              style={{ width: 56 }}
              value={getZTag(draft.name) ?? ''}
              placeholder="—"
              onChange={(e) => {
                const raw = e.target.value.trim();
                const z = raw === '' ? null : Number(raw);
                commitDraft((prev) => ({ ...prev, name: setZTag(prev.name, z === null || Number.isNaN(z) ? null : z) }));
              }}
            />
          </FieldCol>
          <PageOps>
            <OpBtn onClick={addPage}>{t('me_events_new_page')}</OpBtn>
            <OpBtn onClick={copyPage}>{t('me_events_copy_page')}</OpBtn>
            <PasteWrap>
              <OpBtn onClick={() => pastePage('after')} disabled={!pageClipboard} style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                {t('me_events_paste_page')}
              </OpBtn>
              <CaretBtn onClick={() => setPasteMenuOpen((v) => !v)} disabled={!pageClipboard} title={t('me_events_paste_where')}>▾</CaretBtn>
              {pasteMenuOpen && pageClipboard && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setPasteMenuOpen(false)} />
                  <PasteMenu>
                    <PasteMenuItem onClick={() => pastePage('after')}>{t('me_events_paste_after')}</PasteMenuItem>
                    <PasteMenuItem onClick={() => pastePage('before')}>{t('me_events_paste_before')}</PasteMenuItem>
                    <PasteMenuItem onClick={() => pastePage('this')}>{t('me_events_paste_this')}</PasteMenuItem>
                  </PasteMenu>
                </>
              )}
            </PasteWrap>
            <OpBtn onClick={deletePage} disabled={draft.pages.length <= 1} $danger>{t('me_events_delete_page')}</OpBtn>
            <OpBtn onClick={clearPage}>{t('me_events_clear_page')}</OpBtn>
          </PageOps>
        </Header>

        <TabsRow>
          {draft.pages.map((_, i) => (
            <Tab
              key={i}
              $active={i === pageIndex}
              onClick={() => setPageIndex(i)}
              draggable
              title={t('me_events_drag_page_hint')}
              onDragStart={(e) => { setDragPageIndex(i); e.dataTransfer.effectAllowed = 'move'; }}
              onDragEnd={() => { setDragPageIndex(null); setDragOverPageIndex(null); }}
              onDragOver={(e) => { if (dragPageIndex === null) return; e.preventDefault(); if (dragOverPageIndex !== i) setDragOverPageIndex(i); }}
              onDragLeave={() => setDragOverPageIndex((prev) => (prev === i ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragPageIndex !== null) reorderPages(dragPageIndex, i);
                setDragPageIndex(null);
                setDragOverPageIndex(null);
              }}
              style={{
                opacity: dragPageIndex === i ? 0.4 : undefined,
                // Drop indicator: accent bar on the left of the tab it would land before.
                boxShadow: dragOverPageIndex === i && dragPageIndex !== null && dragPageIndex !== i ? 'inset 2px 0 0 0 #7b6ef6' : undefined,
              }}
            >
              {i + 1}
            </Tab>
          ))}
        </TabsRow>

        <Body {...{ [DIALOG_BODY_ATTR]: '' }}>
          <LeftColumn>
            <ConditionsBlock condition={page.condition} patchCondition={patchCondition} systemNames={systemNames} />

            <SideBySide>
              <Block>
                <BlockTitle>{t('me_events_graphic')}</BlockTitle>
                <div>
                  <GraphicPreview onClick={() => setPickerOpen((v) => !v)} title={page.graphic.characterName || t('me_events_pick_graphic')}>
                    {page.graphic.characterName && projectPath && (
                      animatePreview ? (
                        <AnimatedCharacterPreview
                          projectPath={projectPath}
                          characterName={page.graphic.characterName}
                          fitW={86}
                          fitH={96}
                          direction={page.graphic.direction}
                        />
                      ) : (
                        <CharacterSprite
                          projectPath={projectPath}
                          characterName={page.graphic.characterName}
                          direction={page.graphic.direction}
                          pattern={page.graphic.pattern}
                          fitW={86}
                          fitH={96}
                        />
                      )
                    )}
                  </GraphicPreview>
                  <CheckLabel style={{ marginTop: 6 }}>
                    <Toggle checked={animatePreview} onChange={(e) => setAnimatePreview(e.target.checked)} />
                    {t('me_events_animate_preview')}
                  </CheckLabel>
                </div>
              </Block>
              <Block $grow>
                <BlockTitle>{t('me_events_autonomous_movement')}</BlockTitle>
                <Row>
                  <Dim>{t('me_events_move_type')}</Dim>
                  <SmallSelect value={page.moveType} onChange={(e) => patchPage({ moveType: Number(e.target.value) })}>
                    {MOVE_TYPES.map((key, i) => (
                      <option key={key} value={i}>{t(`me_events_move_${key}`)}</option>
                    ))}
                  </SmallSelect>
                </Row>
                <Row>
                  {/* A page's move route only runs on the Custom move type —
                      move_type_random/approach ignore it entirely. */}
                  <OpBtn
                    onClick={() => setMoveRouteOpen(true)}
                    disabled={page.moveType !== CUSTOM_MOVE_TYPE}
                    title={page.moveType === CUSTOM_MOVE_TYPE ? t('me_events_move_route_hint') : t('me_events_move_route_needs_custom')}
                  >
                    {t('me_events_move_route')}
                  </OpBtn>
                </Row>
                <Row>
                  <Dim>{t('me_events_speed')}</Dim>
                  <SmallSelect value={page.moveSpeed} onChange={(e) => patchPage({ moveSpeed: Number(e.target.value) })}>
                    {MOVE_SPEEDS.map((key, i) => (
                      <option key={key} value={i + 1}>{i + 1}: {t(`me_events_speed_${key}`)}</option>
                    ))}
                  </SmallSelect>
                </Row>
                <Row>
                  <Dim>{t('me_events_freq')}</Dim>
                  <SmallSelect value={page.moveFrequency} onChange={(e) => patchPage({ moveFrequency: Number(e.target.value) })}>
                    {MOVE_FREQS.map((key, i) => (
                      <option key={key} value={i + 1}>{i + 1}: {t(`me_events_freq_${key}`)}</option>
                    ))}
                  </SmallSelect>
                </Row>
              </Block>
            </SideBySide>
            {pickerOpen && (
              <Block>
                <SearchInput
                  value={graphicSearch}
                  onChange={(e) => setGraphicSearch(e.target.value)}
                  placeholder={t('me_events_graphic_search')}
                  autoFocus
                />
                {(() => {
                  const matches = characterFiles.filter((file) => file.toLowerCase().includes(deferredGraphicSearch.toLowerCase()));
                  const shown = matches.slice(0, 60);
                  return (
                    <>
                      <PickerGrid>
                        <PickerCell $active={!page.graphic.characterName} onClick={() => { patchGraphic({ characterName: '' }); setPickerOpen(false); }}>
                          {t('me_events_no_graphic')}
                        </PickerCell>
                        {shown.map((file) => (
                          <PickerCell key={file} $active={page.graphic.characterName === file.replace(/\.(png|gif)$/i, '')} title={file}
                            onClick={() => {
                              // RMXP/PSDK convention: @character_name has NO file
                              // extension — RPG::Cache resolves it. Storing
                              // "0001.png" makes PSDK return raw PNG bytes and
                              // crash with `undefined method 'width' for String`.
                              patchGraphic({ characterName: file.replace(/\.(png|gif)$/i, ''), tileId: 0 });
                              setPickerOpen(false);
                            }}
                            onMouseEnter={() => setHoveredGraphic(file)}
                            onMouseLeave={() => setHoveredGraphic((prev) => (prev === file ? null : prev))}>
                            {projectPath && (hoveredGraphic === file ? (
                              <AnimatedCharacterPreview projectPath={projectPath} characterName={file} fitW={64} fitH={66} direction={page.graphic.direction} />
                            ) : (
                              <CharacterSprite projectPath={projectPath} characterName={file} direction={page.graphic.direction} pattern={page.graphic.pattern} fitW={64} fitH={66} />
                            ))}
                          </PickerCell>
                        ))}
                      </PickerGrid>
                      <Row style={{ marginTop: 6 }}>
                        {matches.length > shown.length && <Dim>{t('me_events_graphic_more', { count: matches.length - shown.length })}</Dim>}
                        <OpBtn
                          style={{ marginLeft: 'auto' }}
                          onClick={() =>
                            projectPath &&
                            window.api.chooseCharacterGraphic(
                              { projectPath },
                              ({ name }) => {
                                patchGraphic({ characterName: name, tileId: 0 });
                                setPickerOpen(false);
                              },
                              () => {},
                            )
                          }
                        >
                          {t('me_events_open_folder')}
                        </OpBtn>
                      </Row>
                    </>
                  );
                })()}
                <Row style={{ marginTop: 8 }}>
                  <Dim>{t('me_events_direction')}</Dim>
                  <SmallSelect value={page.graphic.direction} onChange={(e) => patchGraphic({ direction: Number(e.target.value) })}>
                    {DIRECTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{t(`me_events_dir_${d.key}`)}</option>
                    ))}
                  </SmallSelect>
                  <Dim>{t('me_events_pattern')}</Dim>
                  <SmallSelect value={page.graphic.pattern} onChange={(e) => patchGraphic({ pattern: Number(e.target.value) })}>
                    {[0, 1, 2, 3].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </SmallSelect>
                  <Dim>{t('me_events_opacity')}</Dim>
                  <SmallInput type="number" min={0} max={255} value={page.graphic.opacity}
                    onChange={(e) => patchGraphic({ opacity: Math.max(0, Math.min(255, Number(e.target.value) || 0)) })} />
                </Row>
              </Block>
            )}

            <SideBySide>
              <Block $grow>
                <BlockTitle>{t('me_events_options')}</BlockTitle>
                <Row><CheckLabel><Toggle checked={page.isWalkAnime} onChange={(e) => patchPage({ isWalkAnime: e.target.checked })} />{t('me_events_move_animation')}</CheckLabel></Row>
                <Row><CheckLabel><Toggle checked={page.isStepAnime} onChange={(e) => patchPage({ isStepAnime: e.target.checked })} />{t('me_events_stop_animation')}</CheckLabel></Row>
                <Row><CheckLabel><Toggle checked={page.isDirectionFix} onChange={(e) => patchPage({ isDirectionFix: e.target.checked })} />{t('me_events_direction_fix')}</CheckLabel></Row>
                <Row><CheckLabel><Toggle checked={page.isThrough} onChange={(e) => patchPage({ isThrough: e.target.checked })} />{t('me_events_through')}</CheckLabel></Row>
                <Row><CheckLabel><Toggle checked={page.isAlwaysOnTop} onChange={(e) => patchPage({ isAlwaysOnTop: e.target.checked })} />{t('me_events_always_on_top')}</CheckLabel></Row>
              </Block>
              <Block $grow>
                <BlockTitle>{t('me_events_trigger')}</BlockTitle>
                {TRIGGERS.map((key, i) => (
                  <Row key={key}>
                    <CheckLabel>
                      <input type="radio" name="me-event-trigger" checked={page.trigger === i} onChange={() => patchPage({ trigger: i })} />
                      {t(`me_events_trigger_${key}`)}
                    </CheckLabel>
                  </Row>
                ))}
              </Block>
            </SideBySide>
          </LeftColumn>

          <RightColumn>
            {/* key={pageIndex}: switching pages remounts the editor, resetting its
                selection/open-form (the old inline reset-on-pageIndex effect). */}
            <CommandListEditor
              key={pageIndex}
              list={page.list as WorkingCommand[]}
              setList={setList}
              systemNames={systemNames}
              mapEvents={mapEvents}
              subjectName={stripNameTags(draft.name)}
              getMapSnapshot={getMapSnapshot}
              currentMapId={currentMapId}
              mapWidthTiles={mapWidthTiles}
              mapHeightTiles={mapHeightTiles}
              onEditCommonEvents={() => setCommonEventsOpen(true)}
              onBerryTreeSetup={applyBerryTreeSetup}
              expanded={expanded}
            />
          </RightColumn>
        </Body>

        {moveRouteOpen && (
          <MoveRouteDialog
            route={page.moveRoute}
            subject={stripNameTags(draft.name)}
            systemNames={systemNames}
            audioFiles={audioFiles}
            mapEvents={mapEvents.map((e) => ({ id: e.id, name: stripNameTags(e.name) }))}
            onApply={(route) => {
              patchPage({ moveRoute: route });
              setMoveRouteOpen(false);
            }}
            onClose={() => setMoveRouteOpen(false)}
          />
        )}

        {commonEventsOpen && <CommonEventsDialog onClose={() => setCommonEventsOpen(false)} />}

        <Footer>
          <OpBtn $danger onClick={() => { onDelete(draft.id); onClose(); }}>
            {t('me_events_delete_event')}
          </OpBtn>
          <span style={{ flex: 1 }} />
          <FooterBtn $primary onClick={() => { onSave(draft); onClose(); }}>{t('me_events_ok')}</FooterBtn>
          <FooterBtn onClick={onClose}>{t('me_events_cancel')}</FooterBtn>
          <FooterBtn onClick={() => onSave(draft)}>{t('me_events_apply')}</FooterBtn>
        </Footer>
      </Dialog>
    </Scrim>
  );
};
