import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getText, useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectMaps } from '@hooks/useProjectData';
import {
  BLOCK_OPENERS,
  blockSpan,
  buildChains,
  collectLabels,
  decodeCommandPretty,
  INSERT_OPENERS,
  avoidChoicesGap,
  isChainDeletable,
  isChainEditable,
  isChainReorderable,
  stripNameTags,
  type CommandChain,
  type WorkingCommand,
} from './rmxpEventUtils';
import { isEditableConditional } from './conditions';
import {
  BlockTitle,
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
  Dim,
  OpBtn,
  PickerPanel,
  Row,
  SearchInput,
  SmallSelect,
} from './dialog/styles';
import { RubyCode } from './dialog/RubyCode';
import { CommandForm } from './dialog/CommandForm';
import { MoveRouteDialog } from './dialog/MoveRouteDialog';
import { ChangeFogDialog } from './dialog/ChangeFogDialog';
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

/**
 * The RMXP-style command-list editor: the command rows, the "Add command"
 * picker, per-command form (CommandForm), Set Move Route dialog, and all the
 * insert/edit/delete/reorder/clipboard orchestration.
 *
 * Extracted from EventDialog so it can be reused verbatim by the common-event
 * editor. It operates purely on a `list` + `setList` pair (the exact seam
 * EventDialog already committed through), so the keep-protocol provenance
 * (`__keep`) on the commands is preserved untouched — nothing here rebuilds a
 * command it isn't editing.
 *
 * Ancillary data (audio/picture files, project maps, common-event names, CSV
 * resolution) is loaded internally so both dialogs get it for free; switch/
 * variable NAMES come in as a prop since the host also needs them elsewhere.
 */

let commandClipboardShared: WorkingCommand[] | null = null;

type Props = {
  list: WorkingCommand[];
  setList: (list: WorkingCommand[]) => void;
  systemNames: { switches: string[]; variables: string[] };
  /** Events on the map, for the move-route target + per-event wait. Empty for a common event. */
  mapEvents: { id: number; name: string }[];
  /** Label for the move-route "this event" subject (event/common-event name). */
  subjectName: string;
  getMapSnapshot?: () => string | null;
  currentMapId?: number;
  mapWidthTiles?: number;
  mapHeightTiles?: number;
  /** When set, the Call Common Event form shows an "Edit common events" button. */
  onEditCommonEvents?: () => void;
};

export const CommandListEditor = ({ list, setList, systemNames, mapEvents, subjectName, getMapSnapshot, currentMapId, mapWidthTiles, mapHeightTiles, onEditCommonEvents }: Props) => {
  const { t } = useTranslation();
  const [{ projectPath, projectText, projectConfig, projectStudio }] = useGlobalState();
  const { projectDataValues: studioMaps } = useProjectMaps();
  const getEntityName = useGetEntityNameText();

  const [cmdSel, setCmdSel] = useState<number | null>(null);
  const [cmdSel2, setCmdSel2] = useState<number | null>(null);
  const [cmdForm, setCmdForm] = useState<CmdForm | null>(null);
  const [cmdPickerOpen, setCmdPickerOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [dragChainIndex, setDragChainIndex] = useState<number | null>(null);
  const [dragOverChainIndex, setDragOverChainIndex] = useState<number | null>(null);

  const chains = useMemo(() => buildChains(list), [list]);
  const pageLabels = useMemo(() => collectLabels(list), [list]);
  const selChain = cmdSel !== null ? chains[cmdSel] : undefined;
  const selLo = cmdSel === null ? null : cmdSel2 === null ? cmdSel : Math.min(cmdSel, cmdSel2);
  const selHi = cmdSel === null ? null : cmdSel2 === null ? cmdSel : Math.max(cmdSel, cmdSel2);
  const isRange = selLo !== null && selHi !== null && selHi > selLo;

  // --- ancillary data ---------------------------------------------------------
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const audioFolder = cmdForm && isAudioKind(cmdForm.kind) ? AUDIO_KINDS[cmdForm.kind].folder : cmdForm?.kind === 'moveRoute' ? 'se' : null;
  useEffect(() => {
    if (!projectPath || !audioFolder) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/Audio/${audioFolder}`, extensions: ['.ogg', '.mp3', '.wav', '.mid', '.flac'], isFileNameOnly: true },
      ({ filePaths }) =>
        setAudioFiles(
          filePaths
            .map((f) => f.replace(/^.*[\\/]/, ''))
            .map((file) => ({ file, name: file.replace(/\.[^.]+$/, '') }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      () => setAudioFiles([]),
    );
  }, [projectPath, audioFolder]);

  const projectMaps = useMemo(
    () =>
      Object.values(studioMaps)
        .map((m) => ({ id: m.id, name: getEntityName({ klass: 'Map', id: m.id }) || `Map ${m.id}`, tiledFilename: m.tiledFilename }))
        .sort((a, b) => a.id - b.id),
    [studioMaps, getEntityName],
  );

  const [pictureFiles, setPictureFiles] = useState<string[]>([]);
  const needsPictures = cmdForm?.kind === 'showPicture';
  useEffect(() => {
    if (!projectPath || !needsPictures) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/graphics/pictures`, extensions: ['.png', '.gif', '.jpg', '.jpeg', '.bmp'], isFileNameOnly: true },
      ({ filePaths }) => setPictureFiles(filePaths.map((f) => f.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '')).sort((a, b) => a.localeCompare(b))),
      () => setPictureFiles([]),
    );
  }, [projectPath, needsPictures]);

  const [fogFiles, setFogFiles] = useState<string[]>([]);
  const needsFogs = cmdForm?.kind === 'changeFog';
  useEffect(() => {
    if (!projectPath || !needsFogs) return;
    window.api.getFilePathsFromFolder(
      { folderPath: `${projectPath}/graphics/fogs`, extensions: ['.png', '.gif', '.jpg', '.jpeg', '.bmp'], isFileNameOnly: true },
      ({ filePaths }) => setFogFiles(filePaths.map((f) => f.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '')).sort((a, b) => a.localeCompare(b))),
      () => setFogFiles([]),
    );
  }, [projectPath, needsFogs]);

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
  const isCsvFile = useCallback((fileId: number) => !!projectText[fileId], [projectText]);

  // --- command ops ------------------------------------------------------------
  const insertionPoint = (): { index: number; indent: number } => {
    if (selChain && selChain.entries[0].code !== 0) {
      const head = selChain.entries[0];
      if (INSERT_OPENERS.has(head.code)) {
        const index = selChain.start + selChain.entries.length;
        return { index: avoidChoicesGap(list, index) ? index + 1 : index, indent: head.indent + 1 };
      }
      return { index: selChain.start + selChain.entries.length, indent: head.indent };
    }
    if (selChain && selChain.entries[0].code === 0) {
      return { index: selChain.start, indent: selChain.entries[0].indent };
    }
    const last = list[list.length - 1];
    return last && last.code === 0 ? { index: list.length - 1, indent: last.indent } : { index: list.length, indent: 0 };
  };

  const moveTargetName = (target: number): string => {
    if (target === -1) return t('me_events_move_target_player');
    if (target === 0) return subjectName;
    const found = mapEvents.find((e) => e.id === target);
    return found ? `[${found.id}] ${stripNameTags(found.name)}` : `[${target}]`;
  };

  const submitMoveRoute = (form: CmdForm) => {
    const next = [...list];
    if (form.mode === 'edit' && selChain) {
      const fresh = buildCommandsFromForm(form, selChain.entries[0].indent);
      next.splice(selChain.start, selChain.entries.length, ...fresh);
    } else {
      const { index, indent } = insertionPoint();
      next.splice(index, 0, ...buildCommandsFromForm(form, indent));
    }
    setList(next);
    setCmdForm(null);
  };

  const submitForm = () => {
    if (!cmdForm) return;
    const next = [...list];
    if (cmdForm.mode === 'edit' && selChain) {
      if (cmdForm.kind === 'choices') {
        const span = blockSpan(next, selChain.start);
        const rebuilt = rebuildChoicesBlock(cmdForm, next.slice(span.start, span.end));
        next.splice(span.start, span.end - span.start, ...rebuilt);
      } else if (cmdForm.kind === 'conditional') {
        const span = blockSpan(next, selChain.start);
        const rebuilt = rebuildConditionalBlock(cmdForm, next.slice(span.start, span.end));
        next.splice(span.start, span.end - span.start, ...rebuilt);
      } else {
        const fresh = buildCommandsFromForm(cmdForm, selChain.entries[0].indent);
        next.splice(selChain.start, selChain.entries.length, ...fresh);
      }
    } else {
      const { index, indent } = insertionPoint();
      next.splice(index, 0, ...buildCommandsFromForm(cmdForm, indent));
    }
    setList(next);
    setCmdForm(null);
  };

  const deleteChain = () => {
    if (cmdSel === null || selLo === null || selHi === null) return;
    const next = [...list];
    let start: number;
    let end: number;
    if (isRange) {
      start = chains[selLo].start;
      const lastChain = chains[selHi];
      end = lastChain.entries[0].code === 0 ? lastChain.start : lastChain.start + lastChain.entries.length;
    } else {
      if (!selChain || !isChainDeletable(selChain)) return;
      const span = blockSpan(next, selChain.start);
      start = span.start;
      end = span.end;
    }
    if (end <= start) return;
    next.splice(start, end - start);
    setList(next);
    setCmdSel(null);
    setCmdSel2(null);
  };

  const indentAfter = (above: WorkingCommand | undefined): number =>
    above ? (INSERT_OPENERS.has(above.code) ? above.indent + 1 : above.indent) : 0;

  const relocateChain = (rest: WorkingCommand[], moved: WorkingCommand[], insertPos: number, dodge: -1 | 1) => {
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
    if (!neighbor || neighbor.entries[0].code === 0) return;
    const sel = selChain.entries;
    const rest = [...list.slice(0, selChain.start), ...list.slice(selChain.start + sel.length)];
    if (dir === 1) relocateChain(rest, sel, neighbor.start - sel.length + neighbor.entries.length, 1);
    else relocateChain(rest, sel, neighbor.start, -1);
  };

  const moveChainTo = (from: number, to: number) => {
    if (from === to || from + 1 === to) return;
    const source = chains[from];
    const target = chains[to];
    if (!source || !target || !isChainReorderable(source)) return;
    const sel = source.entries;
    const rest = [...list.slice(0, source.start), ...list.slice(source.start + sel.length)];
    const insertPos = target.start > source.start ? target.start - sel.length : target.start;
    relocateChain(rest, sel, insertPos, -1);
  };

  const openInsert = (kind: CmdFormKind) => {
    const form = emptyForm(kind, 'insert');
    if (kind === 'jump' && pageLabels.length > 0) form.text = pageLabels[0];
    if (kind === 'transfer' && currentMapId && currentMapId > 0) form.transferMapId = currentMapId;
    setCmdSel2(null);
    setCmdPickerOpen(false);
    setCmdSearch('');
    setCmdForm(form);
  };
  const openChoicesEdit = (chain: CommandChain) => {
    const span = blockSpan(list, chain.start);
    setCmdPickerOpen(false);
    setCmdForm(choicesFormFromBlock(list.slice(span.start, span.end), isCsvFile));
  };
  const openConditionalEdit = (chain: CommandChain) => {
    const span = blockSpan(list, chain.start);
    const form = conditionalFormFromBlock(list.slice(span.start, span.end));
    if (!form) return;
    setCmdPickerOpen(false);
    setCmdForm(form);
  };
  const openPickerAt = (chainIndex: number) => {
    setCmdSel(chainIndex);
    setCmdSel2(null);
    setCmdForm(null);
    setCmdSearch('');
    setCmdPickerOpen(true);
  };

  const canEditChain =
    !isRange &&
    !!selChain &&
    (isChainEditable(selChain) ||
      selChain.entries[0].code === 102 ||
      (selChain.entries[0].code === 111 && isEditableConditional(selChain.entries[0].parameters)));
  const openEdit = () => {
    if (!selChain) return;
    if (selChain.entries[0].code === 102) return openChoicesEdit(selChain);
    if (selChain.entries[0].code === 111) return openConditionalEdit(selChain);
    const form = formFromChain(selChain, isCsvFile);
    if (form) {
      setCmdPickerOpen(false);
      setCmdForm(form);
    }
  };

  const commandGroups: { key: string; kinds: CmdFormKind[] }[] = [
    { key: 'messages', kinds: ['text', 'comment'] },
    { key: 'flow', kinds: ['choices', 'conditional', 'loop', 'break', 'label', 'jump', 'commonEvent'] },
    { key: 'movement', kinds: ['moveRoute', 'waitMove', 'transfer'] },
    { key: 'screen', kinds: ['tintScreen', 'screenFlash', 'changeFog', 'fogTone', 'showPicture', 'movePicture', 'erasePicture', 'pictureTone', 'screenShake', 'scrollMap', 'prepareTransition', 'executeTransition'] },
    { key: 'game', kinds: ['changeGold', 'transparent', 'eraseEvent', 'menuAccess', 'returnToTitle'] },
    { key: 'audio', kinds: ['playSe', 'playMe', 'playBgm', 'playBgs', 'fadeBgm', 'fadeBgs', 'stopSe', 'memorizeBgm', 'restoreBgm', 'battleBgm'] },
    { key: 'party', kinds: ['creature', 'item'] },
    { key: 'data', kinds: ['switch', 'variable', 'selfSwitch'] },
    { key: 'other', kinds: ['wait', 'script'] },
  ];
  const cmdName = (kind: CmdFormKind) => t(`me_events_cmd_${kind === 'selfSwitch' ? 'self_switch' : kind}`);
  const cmdHint = (kind: CmdFormKind) => t(`me_events_hint_${kind === 'selfSwitch' ? 'self_switch' : kind}`);

  // --- clipboard --------------------------------------------------------------
  const copyChain = useCallback(
    (cut: boolean) => {
      if (cmdSel === null || selLo === null || selHi === null) return;
      let start: number;
      let end: number;
      if (isRange) {
        start = chains[selLo].start;
        const lastChain = chains[selHi];
        end = lastChain.entries[0].code === 0 ? lastChain.start : lastChain.start + lastChain.entries.length;
      } else if (selChain) {
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
      commandClipboardShared = list.slice(start, end).map(({ code, indent, parameters }) => ({ code, indent, parameters: JSON.parse(JSON.stringify(parameters)) }));
      if (cut) deleteChain();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selChain, isRange, selLo, selHi, cmdSel, chains, list],
  );

  const pasteChain = useCallback(() => {
    if (!commandClipboardShared || commandClipboardShared.length === 0) return;
    const clip = commandClipboardShared;
    const next = [...list];
    const target: CommandChain | undefined = selChain ?? chains[chains.length - 1];
    let at = target ? target.start : next.length;
    let baseIndent = target ? target.entries[0].indent : 0;
    if (avoidChoicesGap(next, at)) {
      at += 1;
      baseIndent += 1;
    }
    const delta = baseIndent - clip[0].indent;
    next.splice(at, 0, ...clip.map((cmd) => ({ code: cmd.code, indent: Math.max(0, cmd.indent + delta), parameters: JSON.parse(JSON.stringify(cmd.parameters)) })));
    setList(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selChain, chains, list]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cmdForm) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
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
  }, [cmdForm, copyChain, pasteChain, selChain, isRange]);

  const moveLabel = useCallback((key: string) => t(`me_move_${key}`), [t]);
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
                boxShadow: dragOverChainIndex === chainIndex && dragChainIndex !== null && entryIndex === 0 ? 'inset 0 2px 0 0 #7b6ef6' : undefined,
              }}
              onClick={(e) => {
                if (e.shiftKey && cmdSel !== null) setCmdSel2(chainIndex);
                else { setCmdSel(chainIndex); setCmdSel2(null); }
              }}
              onDoubleClick={() => {
                const code = chain.entries[0].code;
                if (code === 0 || code === 402 || code === 403) return openPickerAt(chainIndex);
                setCmdSel(chainIndex);
                setCmdSel2(null);
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
    <>
      <BlockTitle style={{ margin: 0 }}>{t('me_events_command_list')}</BlockTitle>
      <CommandList>{commandRows}</CommandList>
      <CmdToolbar>
        <OpBtn onClick={() => { setCmdForm(null); setCmdSearch(''); setCmdPickerOpen((v) => !v); }} style={cmdPickerOpen ? { borderColor: '#7b6ef6' } : undefined}>
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
            const kinds = query ? group.kinds.filter((k) => cmdName(k).toLowerCase().includes(query) || cmdHint(k).toLowerCase().includes(query)) : group.kinds;
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
      {cmdForm && cmdForm.kind !== 'moveRoute' && cmdForm.kind !== 'changeFog' && (
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
          mapWidthTiles={mapWidthTiles}
          mapHeightTiles={mapHeightTiles}
          onEditCommonEvents={onEditCommonEvents}
        />
      )}
      {cmdForm?.kind === 'moveRoute' && (
        <MoveRouteDialog
          route={cmdForm.moveRoute}
          subject={moveTargetName(cmdForm.moveTarget)}
          systemNames={systemNames}
          audioFiles={audioFiles}
          targetPicker={
            <Row>
              <Dim>{t('me_events_move_target')}</Dim>
              <SmallSelect style={{ flex: 1 }} value={cmdForm.moveTarget} onChange={(e) => setCmdForm({ ...cmdForm, moveTarget: Number(e.target.value) })}>
                <option value={-1}>{t('me_events_move_target_player')}</option>
                <option value={0}>{t('me_events_move_target_this')}</option>
                {mapEvents.map((e) => (
                  <option key={e.id} value={e.id}>{`[${e.id}] ${stripNameTags(e.name)}`}</option>
                ))}
              </SmallSelect>
            </Row>
          }
          onApply={(route) => submitMoveRoute({ ...cmdForm, moveRoute: route })}
          onClose={() => setCmdForm(null)}
        />
      )}
      {cmdForm?.kind === 'changeFog' && (
        <ChangeFogDialog
          form={cmdForm}
          setForm={setCmdForm}
          fogFiles={fogFiles}
          getMapSnapshot={getMapSnapshot}
          onSubmit={submitForm}
          onCancel={() => setCmdForm(null)}
        />
      )}
    </>
  );
};
