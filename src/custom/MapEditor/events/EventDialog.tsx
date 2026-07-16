import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getText } from '@utils/ReadingProjectText';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMaps } from '@hooks/useProjectData';
import type { MapEvent, MapEventPage } from './useMapEvents';
import {
  BLOCK_OPENERS,
  blockSpan,
  buildChains,
  collectLabels,
  composeEventName,
  CONDITION_OPERATORS,
  createEmptyPage,
  decodeCommandPretty,
  DIRECTIONS,
  getZTag,
  hasShadowlessTag,
  INSERT_OPENERS,
  avoidChoicesGap,
  isChainDeletable,
  isChainEditable,
  isChainReorderable,
  MOVE_FREQS,
  MOVE_SPEEDS,
  MOVE_TYPES,
  CUSTOM_MOVE_TYPE,
  setShadowlessTag,
  setZTag,
  stripNameTags,
  TRIGGERS,
  type CommandChain,
  type WorkingCommand,
} from './rmxpEventUtils';
import { isEditableConditional } from './conditions';
import { AnimatedCharacterPreview, CharacterSprite } from './CharacterSprite';
import {
  Block,
  BlockTitle,
  Body,
  CaretBtn,
  CheckLabel,
  CmdBody,
  CmdComment,
  CmdCont,
  CmdGrid,
  CmdGroupTitle,
  CmdItem,
  CmdItemHint,
  CmdItemName,
  CmdLabel,
  CmdToolbar,
  CommandList,
  CommandRow,
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
  PickerPanel,
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
import { RubyCode } from './dialog/RubyCode';
import { ConditionsBlock } from './dialog/ConditionsBlock';
import { CommandForm } from './dialog/CommandForm';
import { MoveRouteDialog } from './dialog/MoveRouteDialog';
import type { AudioFile } from './dialog/AudioPicker';
import {
  AUDIO_KINDS,
  buildCommandsFromForm,
  choicesFormFromBlock,
  conditionalFormFromBlock,
  emptyForm,
  formFromChain,
  isAudioKind,
  rebuildChoicesBlock,
  rebuildConditionalBlock,
  type CmdForm,
  type CmdFormKind,
} from './dialog/commandModel';
import { useEventDraft } from './dialog/useEventDraft';

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
};

// Page clipboard lives at module scope so a page copied in one event can be
// pasted into ANOTHER event (its provenance carries the command list over).
let pageClipboardShared: MapEventPage | null = null;
// Command clipboard (module scope: paste across pages/events). Entries are
// stored WITHOUT __keep provenance — pasted commands are always fresh, so
// only plain-param chains (the editable set) are copyable.
let commandClipboardShared: WorkingCommand[] | null = null;

export const EventDialog = ({ event, mapEvents, onSave, onDelete, onClose, getMapSnapshot }: Props) => {
  const { t } = useTranslation();
  const [{ projectPath, projectText, projectConfig, projectStudio }] = useGlobalState();
  const { draft, commitDraft, undo, redo, canUndo, canRedo } = useEventDraft(event);
  const { projectDataValues: studioMaps } = useProjectMaps();
  const getEntityName = useGetEntityNameText();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageClipboard, setPageClipboard] = useState<MapEventPage | null>(pageClipboardShared);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [characterFiles, setCharacterFiles] = useState<string[]>([]);
  const [cmdSel, setCmdSel] = useState<number | null>(null);
  // Second endpoint of a shift-click range selection (null = single selection).
  const [cmdSel2, setCmdSel2] = useState<number | null>(null);
  const [cmdForm, setCmdForm] = useState<CmdForm | null>(null);
  const [cmdPickerOpen, setCmdPickerOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [graphicSearch, setGraphicSearch] = useState('');
  // Defer filtering so typing in the search box stays responsive with big folders.
  const deferredGraphicSearch = React.useDeferredValue(graphicSearch);
  const [hoveredGraphic, setHoveredGraphic] = useState<string | null>(null);
  const [animatePreview, setAnimatePreview] = useState(false);
  const [dragChainIndex, setDragChainIndex] = useState<number | null>(null);
  const [dragOverChainIndex, setDragOverChainIndex] = useState<number | null>(null);
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
    } else {
      el.style.width = preExpandSize.current?.width ?? '';
      el.style.height = preExpandSize.current?.height ?? '';
      setExpanded(false);
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
  const chains = useMemo(() => buildChains(page.list as WorkingCommand[]), [page.list]);
  const pageLabels = useMemo(() => collectLabels(page.list as WorkingCommand[]), [page.list]);
  const selChain = cmdSel !== null ? chains[cmdSel] : undefined;
  // Normalized selection range (inclusive chain indices). Single selection when
  // cmdSel2 is null or equal to cmdSel.
  const selLo = cmdSel === null ? null : cmdSel2 === null ? cmdSel : Math.min(cmdSel, cmdSel2);
  const selHi = cmdSel === null ? null : cmdSel2 === null ? cmdSel : Math.max(cmdSel, cmdSel2);
  const isRange = selLo !== null && selHi !== null && selHi > selLo;

  useEffect(() => {
    setCmdSel(null);
    setCmdSel2(null);
    setCmdForm(null);
  }, [pageIndex]);

  useEffect(() => {
    if (!pickerOpen || !projectPath || characterFiles.length > 0) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/graphics/characters`, extensions: ['.png', '.gif'], isFileNameOnly: true },
      ({ filePaths }) => setCharacterFiles(filePaths.map((f) => f.replace(/^.*[\\/]/, ''))),
      () => setCharacterFiles([]),
    );
  }, [pickerOpen, projectPath, characterFiles.length]);

  // Audio files for the open audio command's folder (Audio/bgm|bgs|me|se).
  // PSDK stores the name WITHOUT folder or extension, so strip both.
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  // The move-route dialog's Play SE browses Audio/se too, so load that folder
  // whenever either window needs it.
  const audioFolder = cmdForm && isAudioKind(cmdForm.kind) ? AUDIO_KINDS[cmdForm.kind].folder : moveRouteOpen || cmdForm?.kind === 'moveRoute' ? 'se' : null;
  useEffect(() => {
    if (!projectPath || !audioFolder) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/Audio/${audioFolder}`, extensions: ['.ogg', '.mp3', '.wav', '.mid', '.flac'], isFileNameOnly: true },
      ({ filePaths }) =>
        setAudioFiles(
          filePaths
            // RMXP stores the BARE name (no folder, no extension) — but the
            // preview needs the real filename, so keep both.
            .map((f) => f.replace(/^.*[\\/]/, ''))
            .map((file) => ({ file, name: file.replace(/\.[^.]+$/, '') }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      () => setAudioFiles([]),
    );
  }, [projectPath, audioFolder]);

  // Every map in the project, for the Transfer Player picker. The rxdata map id
  // IS the Studio map id (Tiled2Rxdata writes Map%03d.rxdata from it), so no
  // translation is needed. Names live in a CSV text file, not on the entity.
  const projectMaps = useMemo(
    () =>
      Object.values(studioMaps)
        .map((m) => ({ id: m.id, name: getEntityName({ klass: 'Map', id: m.id }) || `Map ${m.id}`, tiledFilename: m.tiledFilename }))
        .sort((a, b) => a.id - b.id),
    [studioMaps, getEntityName],
  );

  // Graphics/Pictures file names for Show Picture — loaded only while a picture
  // form is open. Bare names (no extension); the thumbnail resolves the file.
  const [pictureFiles, setPictureFiles] = useState<string[]>([]);
  const needsPictures = cmdForm?.kind === 'showPicture';
  useEffect(() => {
    if (!projectPath || !needsPictures) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/graphics/pictures`, extensions: ['.png', '.gif', '.jpg', '.jpeg', '.bmp'], isFileNameOnly: true },
      ({ filePaths }) =>
        setPictureFiles(
          filePaths.map((f) => f.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '')).sort((a, b) => a.localeCompare(b)),
        ),
      () => setPictureFiles([]),
    );
  }, [projectPath, needsPictures]);

  // Common event NAMES from Data/CommonEvents.rxdata, so "Call Common Event"
  // can show `[12] Strength` instead of RMXP's bare `12`.
  // The reader returns only the ids that exist, so an UNNAMED common event is
  // still pickable — filtering on the name would silently hide a real one.
  const [commonEvents, setCommonEvents] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    if (!projectPath) return;
    window.api.readRMXPCommonEventNames(
      { projectPath },
      (output) => setCommonEvents(output.commonEvents),
      () => setCommonEvents([]),
    );
  }, [projectPath]);

  const resolveCsv = useCallback(
    (fileId: number, line: number): string | undefined => {
      if (!projectText[fileId]) return undefined;
      const text = getText(
        { texts: projectText, languages: projectStudio.languagesTranslation, defaultLanguage: projectConfig.language_config.defaultLanguage },
        fileId,
        line,
      );
      return text.startsWith('Unable to find') ? undefined : text;
    },
    [projectText, projectConfig, projectStudio],
  );

  /** True when a "file, line" text really points at a CSV in this project. */
  const isCsvFile = useCallback((fileId: number) => !!projectText[fileId], [projectText]);

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

  // --- command ops -------------------------------------------------------------
  const setList = (list: WorkingCommand[]) => patchPage({ list } as Partial<MapEventPage>);

  const insertionPoint = (): { index: number; indent: number } => {
    const list = page.list as WorkingCommand[];
    if (selChain && selChain.entries[0].code !== 0) {
      const head = selChain.entries[0];
      // Selecting a block opener/marker (Show Choices, When, Else, Loop, …)
      // nests the new command as its first child — one indent level deeper,
      // right after the marker line. Otherwise insert as a same-indent sibling.
      if (INSERT_OPENERS.has(head.code)) {
        const index = selChain.start + selChain.entries.length;
        // Selecting the Show Choices line itself: its "first child" is the first
        // When's body, so step past that marker rather than into the illegal gap.
        return { index: avoidChoicesGap(list, index) ? index + 1 : index, indent: head.indent + 1 };
      }
      return { index: selChain.start + selChain.entries.length, indent: head.indent };
    }
    if (selChain && selChain.entries[0].code === 0) {
      return { index: selChain.start, indent: selChain.entries[0].indent };
    }
    // No selection: before the trailing terminator (or at end if malformed).
    const last = list[list.length - 1];
    return last && last.code === 0 ? { index: list.length - 1, indent: last.indent } : { index: list.length, indent: 0 };
  };

  /** Label for a Set Move Route target: Player, this event, or one by id. */
  const moveTargetName = (target: number): string => {
    if (target === -1) return t('me_events_move_target_player');
    if (target === 0) return stripNameTags(draft.name);
    const found = mapEvents.find((e) => e.id === target);
    return found ? `[${found.id}] ${stripNameTags(found.name)}` : `[${target}]`;
  };

  /**
   * Apply a Set Move Route. The 209 owns its 509 lines, so an edit replaces the
   * whole chain (the step count can change) rather than just the head.
   */
  const submitMoveRoute = (form: CmdForm) => {
    const list = [...(page.list as WorkingCommand[])];
    if (form.mode === 'edit' && selChain) {
      const fresh = buildCommandsFromForm(form, selChain.entries[0].indent);
      list.splice(selChain.start, selChain.entries.length, ...fresh);
    } else {
      const { index, indent } = insertionPoint();
      list.splice(index, 0, ...buildCommandsFromForm(form, indent));
    }
    setList(list);
    setCmdForm(null);
  };

  const submitForm = () => {
    if (!cmdForm) return;
    const list = [...(page.list as WorkingCommand[])];
    if (cmdForm.mode === 'edit' && selChain) {
      if (cmdForm.kind === 'choices') {
        // Editing a Show Choices rewrites the WHOLE block (markers + closer),
        // re-attaching each branch's existing commands by position.
        const span = blockSpan(list, selChain.start);
        const rebuilt = rebuildChoicesBlock(cmdForm, list.slice(span.start, span.end));
        list.splice(span.start, span.end - span.start, ...rebuilt);
      } else if (cmdForm.kind === 'conditional') {
        // Same for a Conditional Branch: the form owns the condition and the Else
        // marker, but the branch BODIES have to survive the edit.
        const span = blockSpan(list, selChain.start);
        const rebuilt = rebuildConditionalBlock(cmdForm, list.slice(span.start, span.end));
        list.splice(span.start, span.end - span.start, ...rebuilt);
      } else {
        const fresh = buildCommandsFromForm(cmdForm, selChain.entries[0].indent);
        list.splice(selChain.start, selChain.entries.length, ...fresh);
      }
    } else {
      const { index, indent } = insertionPoint();
      list.splice(index, 0, ...buildCommandsFromForm(cmdForm, indent));
    }
    setList(list);
    setCmdForm(null);
  };

  const deleteChain = () => {
    if (cmdSel === null || selLo === null || selHi === null) return;
    const list = [...(page.list as WorkingCommand[])];
    let start: number;
    let end: number;
    if (isRange) {
      start = chains[selLo].start;
      const lastChain = chains[selHi];
      // Never delete the trailing blank terminator.
      end = lastChain.entries[0].code === 0 ? lastChain.start : lastChain.start + lastChain.entries.length;
    } else {
      if (!selChain || !isChainDeletable(selChain)) return;
      // Block openers (Choices/Conditional/Loop) delete the whole nested block —
      // opener through its matching closer at the same indent.
      const span = blockSpan(list, selChain.start);
      start = span.start;
      end = span.end;
    }
    if (end <= start) return;
    list.splice(start, end - start);
    setList(list);
    setCmdSel(null);
    setCmdSel2(null);
  };

  /**
   * The indent a moved command should adopt if it lands right after `above`.
   * Following a block opener/marker (Choices/When/Else/Loop/Conditional) nests
   * one level deeper; after anything else (including block closers) it sits at
   * that element's own indent. This is what lets a command flow into or out of
   * a branch as it steps past the boundary markers.
   */
  const indentAfter = (above: WorkingCommand | undefined): number =>
    above ? (INSERT_OPENERS.has(above.code) ? above.indent + 1 : above.indent) : 0;

  /**
   * Insert `moved` (a whole chain) into `rest` at `insertPos`, re-indenting it
   * to be valid there, and select it afterwards. `insertPos` is dodged away
   * from the one illegal slot — between `Show Choices` (102) and its first
   * `When` (402) — in the given direction.
   */
  const relocateChain = (rest: WorkingCommand[], moved: WorkingCommand[], insertPos: number, dodge: -1 | 1) => {
    // Never land in the Show-Choices gap (right after a 102, before its When).
    if (rest[insertPos - 1]?.code === 102) insertPos += dodge;
    const delta = indentAfter(rest[insertPos - 1]) - moved[0].indent;
    const shifted = moved.map((c) => ({ ...c, indent: c.indent + delta }));
    const next = [...rest.slice(0, insertPos), ...shifted, ...rest.slice(insertPos)];
    setList(next);
    const idx = buildChains(next).findIndex((c) => c.start === insertPos);
    setCmdSel(idx >= 0 ? idx : null);
  };

  const moveChain = (dir: -1 | 1) => {
    if (cmdSel === null || !selChain || !isChainReorderable(selChain)) return;
    const neighbor = chains[cmdSel + dir];
    if (!neighbor || neighbor.entries[0].code === 0) return; // at a list boundary
    const full = page.list as WorkingCommand[];
    const sel = selChain.entries;
    const rest = [...full.slice(0, selChain.start), ...full.slice(selChain.start + sel.length)];
    if (dir === 1) {
      // Step past the next chain (which now sits sel.length earlier in `rest`).
      relocateChain(rest, sel, neighbor.start - sel.length + neighbor.entries.length, 1);
    } else {
      // Step above the previous chain (unaffected by removing sel below it).
      relocateChain(rest, sel, neighbor.start, -1);
    }
  };

  /** Drag `from` chain to land before `to` chain; indent auto-fits the drop. */
  const moveChainTo = (from: number, to: number) => {
    if (from === to || from + 1 === to) return; // no-op positions
    const source = chains[from];
    const target = chains[to];
    if (!source || !target || !isChainReorderable(source)) return;
    const sel = source.entries;
    const full = page.list as WorkingCommand[];
    const rest = [...full.slice(0, source.start), ...full.slice(source.start + sel.length)];
    const insertPos = target.start > source.start ? target.start - sel.length : target.start;
    relocateChain(rest, sel, insertPos, -1);
  };

  const openInsert = (kind: CmdFormKind) => {
    const form = emptyForm(kind, 'insert');
    // Jump-to-Label defaults to the first existing label in this list.
    if (kind === 'jump' && pageLabels.length > 0) form.text = pageLabels[0];
    setCmdSel2(null); // collapse any range selection when starting an insert
    setCmdPickerOpen(false);
    setCmdSearch('');
    setCmdForm(form);
  };
  /** Open the choices form pre-filled from an existing Show Choices block. */
  const openChoicesEdit = (chain: CommandChain) => {
    const list = page.list as WorkingCommand[];
    const span = blockSpan(list, chain.start);
    setCmdPickerOpen(false);
    setCmdForm(choicesFormFromBlock(list.slice(span.start, span.end), isCsvFile));
  };

  /**
   * Open the conditional form pre-filled from an existing Conditional Branch.
   * Like Show Choices, this needs the whole BLOCK: the chain is only the 111
   * head, which doesn't include the Else marker or the branch bodies.
   */
  const openConditionalEdit = (chain: CommandChain) => {
    const list = page.list as WorkingCommand[];
    const span = blockSpan(list, chain.start);
    const form = conditionalFormFromBlock(list.slice(span.start, span.end));
    // null = a subtype we can't author (facing direction, money, button press…).
    // canEditChain already blocks it; this is the belt to that's braces.
    if (!form) return;
    setCmdPickerOpen(false);
    setCmdForm(form);
  };

  /** Open the "Add command" picker with `chain` selected as the insert target. */
  const openPickerAt = (chainIndex: number) => {
    setCmdSel(chainIndex);
    setCmdSel2(null);
    setCmdForm(null);
    setCmdSearch('');
    setCmdPickerOpen(true);
  };

  // 102/111 aren't "editable commands" in the plain sense — they open their whole
  // block for editing (see submitForm), so they're allowed here explicitly. A 111
  // of a subtype we can't author stays closed rather than being reopened lossily.
  const canEditChain =
    !isRange &&
    !!selChain &&
    (isChainEditable(selChain) ||
      selChain.entries[0].code === 102 ||
      (selChain.entries[0].code === 111 && isEditableConditional(selChain.entries[0].parameters)));
  const openEdit = () => {
    if (!selChain) return;
    // Show Choices and Conditional Branch edit their whole block, not one command.
    if (selChain.entries[0].code === 102) return openChoicesEdit(selChain);
    if (selChain.entries[0].code === 111) return openConditionalEdit(selChain);
    const form = formFromChain(selChain, isCsvFile);
    if (form) {
      setCmdPickerOpen(false);
      setCmdForm(form);
    }
  };

  /** Catalog for the "Add command" picker — grouped like RMXP's command dialog. */
  const commandGroups: { key: string; kinds: CmdFormKind[] }[] = [
    { key: 'messages', kinds: ['text', 'comment'] },
    { key: 'flow', kinds: ['choices', 'conditional', 'loop', 'break', 'label', 'jump', 'commonEvent'] },
    { key: 'movement', kinds: ['moveRoute', 'waitMove', 'transfer'] },
    { key: 'screen', kinds: ['tintScreen', 'screenFlash', 'fogTone', 'showPicture', 'movePicture', 'erasePicture', 'pictureTone', 'screenShake', 'scrollMap', 'prepareTransition', 'executeTransition'] },
    { key: 'game', kinds: ['changeGold', 'transparent', 'eraseEvent', 'menuAccess', 'returnToTitle'] },
    { key: 'audio', kinds: ['playSe', 'playMe', 'playBgm', 'playBgs', 'fadeBgm', 'fadeBgs', 'stopSe', 'memorizeBgm', 'restoreBgm', 'battleBgm'] },
    { key: 'party', kinds: ['creature', 'item'] },
    { key: 'data', kinds: ['switch', 'variable', 'selfSwitch'] },
    { key: 'other', kinds: ['wait', 'script'] },
  ];
  const cmdName = (kind: CmdFormKind) => t(`me_events_cmd_${kind === 'selfSwitch' ? 'self_switch' : kind}`);
  const cmdHint = (kind: CmdFormKind) => t(`me_events_hint_${kind === 'selfSwitch' ? 'self_switch' : kind}`);

  // --- command clipboard (Ctrl+C / Ctrl+X / Ctrl+V, Delete) --------------------
  const copyChain = useCallback(
    (cut: boolean) => {
      if (cmdSel === null || selLo === null || selHi === null) return;
      const list = page.list as WorkingCommand[];
      let start: number;
      let end: number;
      if (isRange) {
        // Multi-line selection: copy the whole span verbatim.
        start = chains[selLo].start;
        const lastChain = chains[selHi];
        end = lastChain.entries[0].code === 0 ? lastChain.start : lastChain.start + lastChain.entries.length;
      } else if (selChain) {
        // Single: a block opener copies its entire block; a plain command copies
        // itself. A lone structural marker (When/Else/End) can't be copied.
        if (BLOCK_OPENERS.has(selChain.entries[0].code)) {
          const span = blockSpan(list, selChain.start);
          start = span.start;
          end = span.end;
        } else if (isChainEditable(selChain)) {
          start = selChain.start;
          end = selChain.start + selChain.entries.length;
        } else {
          return;
        }
      } else {
        return;
      }
      if (end <= start) return;
      // Strip __keep: pasted commands are always written fresh. Relative indents
      // are preserved so nested blocks keep their shape on paste.
      commandClipboardShared = list.slice(start, end).map(({ code, indent, parameters }) => ({ code, indent, parameters: JSON.parse(JSON.stringify(parameters)) }));
      if (cut) deleteChain();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selChain, isRange, selLo, selHi, cmdSel, chains, page.list],
  );

  const pasteChain = useCallback(() => {
    if (!commandClipboardShared || commandClipboardShared.length === 0) return;
    const clip = commandClipboardShared;
    const list = [...(page.list as WorkingCommand[])];
    // Paste ABOVE the (primary) selection, or before the trailing terminator.
    const target: CommandChain | undefined = selChain ?? chains[chains.length - 1];
    let at = target ? target.start : list.length;
    let baseIndent = target ? target.entries[0].indent : 0;
    // Pasting above the first When would land in the illegal Show-Choices gap.
    // There is no legal slot there, so paste INSIDE that branch instead.
    if (avoidChoicesGap(list, at)) {
      at += 1;
      baseIndent += 1;
    }
    // Shift the whole clip so its root lands at the target indent, keeping the
    // internal (relative) indent structure of multi-line blocks intact.
    const delta = baseIndent - clip[0].indent;
    list.splice(at, 0, ...clip.map((cmd) => ({ code: cmd.code, indent: Math.max(0, cmd.indent + delta), parameters: JSON.parse(JSON.stringify(cmd.parameters)) })));
    setList(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selChain, chains, page.list]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cmdForm) return; // a form is open — let inputs handle keys
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') { e.preventDefault(); copyChain(false); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') { e.preventDefault(); copyChain(true); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteChain(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isRange || (selChain && isChainDeletable(selChain))) { e.preventDefault(); deleteChain(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmdForm, copyChain, pasteChain, selChain, isRange, undo, redo]);

  // Memoized command list: decoding + Ruby tokenizing every row is the main
  // per-render cost, and it only depends on the list, selection and drag state —
  // so typing in a command form or condition field no longer re-runs it.
  /** Move-command names for decoding Set Move Route steps (509) in the list. */
  const moveLabel = useCallback((key: string) => t(`me_move_${key}`), [t]);

  /** Name tables for the command list: switches, variables, maps, common events. */
  const decodeNames = useMemo(
    () => ({
      ...systemNames,
      maps: Object.fromEntries(projectMaps.map((m) => [m.id, m.name])),
      commonEvents: Object.fromEntries(commonEvents.map((c) => [c.id, c.name])),
    }),
    [systemNames, projectMaps, commonEvents],
  );

  const commandRows = useMemo(
    () =>
      chains.map((chain, chainIndex) =>
        chain.entries.map((cmd, entryIndex) => {
          const pretty = decodeCommandPretty(cmd, resolveCsv, decodeNames, moveLabel);
          return (
            <CommandRow
              key={`${chain.start}-${entryIndex}`}
              $blank={pretty.kind === 'blank'}
              $script={pretty.kind === 'script'}
              $selected={selLo !== null && selHi !== null && chainIndex >= selLo && chainIndex <= selHi}
              style={{
                paddingLeft: 12 + pretty.indent * 16,
                opacity: dragChainIndex === chainIndex ? 0.4 : undefined,
                // Drop indicator: accent line above the row the chain would land before.
                boxShadow: dragOverChainIndex === chainIndex && dragChainIndex !== null && entryIndex === 0 ? 'inset 0 2px 0 0 #7b6ef6' : undefined,
              }}
              onClick={(e) => {
                // Shift-click extends a multi-line range from the anchor.
                if (e.shiftKey && cmdSel !== null) setCmdSel2(chainIndex);
                else { setCmdSel(chainIndex); setCmdSel2(null); }
              }}
              onDoubleClick={() => {
                const code = chain.entries[0].code;
                // Blank terminator, or a "When"/"When Cancel" branch marker:
                // double-click = "add a command here / inside this branch".
                if (code === 0 || code === 402 || code === 403) return openPickerAt(chainIndex);
                setCmdSel(chainIndex);
                setCmdSel2(null);
                // Show Choices / Conditional Branch: reopen the whole block.
                if (code === 102) return openChoicesEdit(chain);
                if (code === 111) return openConditionalEdit(chain);
                const form = formFromChain(chain, isCsvFile);
                if (form) { setCmdPickerOpen(false); setCmdForm(form); }
              }}
              draggable={isChainReorderable(chain)}
              onDragStart={(e) => { setDragChainIndex(chainIndex); e.dataTransfer.effectAllowed = 'move'; }}
              onDragEnd={() => { setDragChainIndex(null); setDragOverChainIndex(null); }}
              onDragOver={(e) => {
                if (dragChainIndex === null) return;
                e.preventDefault();
                if (dragOverChainIndex !== chainIndex) setDragOverChainIndex(chainIndex);
              }}
              onDragLeave={() => setDragOverChainIndex((prev) => (prev === chainIndex ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragChainIndex !== null) moveChainTo(dragChainIndex, chainIndex);
                setDragChainIndex(null);
                setDragOverChainIndex(null);
              }}
            >
              {pretty.kind === 'blank' && '@>'}
              {pretty.kind === 'comment' && <CmdComment>{entryIndex === 0 ? '# ' : '  '}{pretty.body}</CmdComment>}
              {pretty.kind === 'script' && (
                <>
                  {entryIndex === 0 && <CmdLabel>Script </CmdLabel>}
                  {entryIndex > 0 && '  '}
                  <RubyCode code={pretty.body} />
                </>
              )}
              {pretty.kind === 'cont' && <CmdCont>  {pretty.body}</CmdCont>}
              {pretty.kind === 'normal' && (
                <>
                  <CmdLabel>{pretty.label}</CmdLabel>
                  {pretty.body && <CmdBody> {pretty.body}</CmdBody>}
                </>
              )}
            </CommandRow>
          );
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chains, selLo, selHi, cmdSel, decodeNames, resolveCsv, isCsvFile, moveLabel, dragChainIndex, dragOverChainIndex],
  );

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
              <input
                type="checkbox"
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
                    <input type="checkbox" checked={animatePreview} onChange={(e) => setAnimatePreview(e.target.checked)} />
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
                <Row><CheckLabel><input type="checkbox" checked={page.isWalkAnime} onChange={(e) => patchPage({ isWalkAnime: e.target.checked })} />{t('me_events_move_animation')}</CheckLabel></Row>
                <Row><CheckLabel><input type="checkbox" checked={page.isStepAnime} onChange={(e) => patchPage({ isStepAnime: e.target.checked })} />{t('me_events_stop_animation')}</CheckLabel></Row>
                <Row><CheckLabel><input type="checkbox" checked={page.isDirectionFix} onChange={(e) => patchPage({ isDirectionFix: e.target.checked })} />{t('me_events_direction_fix')}</CheckLabel></Row>
                <Row><CheckLabel><input type="checkbox" checked={page.isThrough} onChange={(e) => patchPage({ isThrough: e.target.checked })} />{t('me_events_through')}</CheckLabel></Row>
                <Row><CheckLabel><input type="checkbox" checked={page.isAlwaysOnTop} onChange={(e) => patchPage({ isAlwaysOnTop: e.target.checked })} />{t('me_events_always_on_top')}</CheckLabel></Row>
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
            <BlockTitle style={{ margin: 0 }}>{t('me_events_command_list')}</BlockTitle>
            <CommandList>{commandRows}</CommandList>
            <CmdToolbar>
              <OpBtn
                onClick={() => { setCmdForm(null); setCmdSearch(''); setCmdPickerOpen((v) => !v); }}
                style={cmdPickerOpen ? { borderColor: '#7b6ef6' } : undefined}
              >
                + {t('me_events_add_command')}
              </OpBtn>
              <span style={{ flex: 1 }} />
              <OpBtn onClick={openEdit} disabled={!canEditChain}>{t('me_events_cmd_edit')}</OpBtn>
              <OpBtn onClick={() => moveChain(-1)} disabled={isRange || !selChain || !isChainReorderable(selChain)}>↑</OpBtn>
              <OpBtn onClick={() => moveChain(1)} disabled={isRange || !selChain || !isChainReorderable(selChain)}>↓</OpBtn>
              <OpBtn onClick={deleteChain} disabled={isRange ? false : !selChain || !isChainDeletable(selChain)} $danger>{t('me_events_cmd_delete')}</OpBtn>
            </CmdToolbar>
            {cmdPickerOpen && !cmdForm && (
              <PickerPanel>
                <SearchInput
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  placeholder={t('me_events_cmd_search')}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') setCmdPickerOpen(false); }}
                />
                {commandGroups.map((group) => {
                  const query = cmdSearch.trim().toLowerCase();
                  const kinds = query
                    ? group.kinds.filter((k) => cmdName(k).toLowerCase().includes(query) || cmdHint(k).toLowerCase().includes(query))
                    : group.kinds;
                  if (kinds.length === 0) return null;
                  return (
                    <React.Fragment key={group.key}>
                      <CmdGroupTitle>{t(`me_events_grp_${group.key}`)}</CmdGroupTitle>
                      <CmdGrid>
                        {kinds.map((kind) => (
                          <CmdItem key={kind} onClick={() => openInsert(kind)}>
                            <CmdItemName>{cmdName(kind)}</CmdItemName>
                            <CmdItemHint>{cmdHint(kind)}</CmdItemHint>
                          </CmdItem>
                        ))}
                      </CmdGrid>
                    </React.Fragment>
                  );
                })}
              </PickerPanel>
            )}
            {/* Set Move Route has no inline form — it opens the route dialog. */}
            {cmdForm && cmdForm.kind !== 'moveRoute' && (
              <CommandForm
                form={cmdForm}
                setForm={setCmdForm}
                onSubmit={submitForm}
                onCancel={() => setCmdForm(null)}
                systemNames={systemNames}
                audioFiles={audioFiles}
                projectMaps={projectMaps}
                commonEvents={commonEvents}
                pictureFiles={pictureFiles}
                mapEvents={mapEvents.map((e) => ({ id: e.id, name: stripNameTags(e.name) }))}
                resolveCsv={resolveCsv}
                pageLabels={pageLabels}
                getMapSnapshot={getMapSnapshot}
              />
            )}
          </RightColumn>
        </Body>

        {moveRouteOpen && (
          <MoveRouteDialog
            route={page.moveRoute}
            subject={stripNameTags(draft.name)}
            systemNames={systemNames}
            audioFiles={audioFiles}
            onApply={(route) => {
              patchPage({ moveRoute: route });
              setMoveRouteOpen(false);
            }}
            onClose={() => setMoveRouteOpen(false)}
          />
        )}

        {/* Set Move Route (209): the same dialog, plus the target picker. */}
        {cmdForm?.kind === 'moveRoute' && (
          <MoveRouteDialog
            route={cmdForm.moveRoute}
            subject={moveTargetName(cmdForm.moveTarget)}
            systemNames={systemNames}
            audioFiles={audioFiles}
            targetPicker={
              <Row>
                <Dim>{t('me_events_move_target')}</Dim>
                <SmallSelect
                  style={{ flex: 1 }}
                  value={cmdForm.moveTarget}
                  onChange={(e) => setCmdForm({ ...cmdForm, moveTarget: Number(e.target.value) })}
                >
                  <option value={-1}>{t('me_events_move_target_player')}</option>
                  <option value={0}>{t('me_events_move_target_this')}</option>
                  {mapEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {`[${e.id}] ${stripNameTags(e.name)}`}
                    </option>
                  ))}
                </SmallSelect>
              </Row>
            }
            onApply={(route) => submitMoveRoute({ ...cmdForm, moveRoute: route })}
            onClose={() => setCmdForm(null)}
          />
        )}

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
