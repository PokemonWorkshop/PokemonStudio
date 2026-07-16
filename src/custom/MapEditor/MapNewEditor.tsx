/**
 * Fork-customized "New map" dialog.
 *
 *   1. Info       — name + description (always visible, no collapse)
 *   2. Data       — map width + map height + steps average + tiled file
 *                   + mandatory tilesets (passages / systemtags / terrain
 *                   tags). Map size required UNLESS importing an .tmx.
 *   3. Musics     — bgm + bgs (collapsible)
 *
 * Bottom: single "Create" button. When the user does NOT import an
 * existing .tmx, we generate a blank .tmx of the requested size with
 * the three mandatory PSDK tilesets pre-referenced — opening the new
 * map in the in-Studio editor lands you on a fresh canvas with the
 * gameplay tilesets already wired up.
 */

import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import {
  FileInput,
  Input,
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
  MultiLineInput,
  PaddedInputContainer,
} from '@components/inputs';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { DropInput } from '@components/inputs/DropInput';
import { TextInputError } from '@components/inputs/Input';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { TooltipWrapper } from '@ds/Tooltip';
import { useMapCopy } from '@hooks/useMapCopy';
import { useMapInfo } from '@hooks/useMapInfo';
import { useProjectMapLinks, useProjectMaps } from '@hooks/useProjectData';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { useGlobalState } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import { createMap, createMapInfo } from '@utils/entityCreation';
import { useLoaderRef } from '@utils/loaderContext';
import { addNewMapInfo, mapInfoNewMapWithParent } from '@utils/MapInfoUtils';
import { TilesetThumb } from './TilesetThumb';
import { createMapLinkFromMainMapId } from '@utils/MapLinkUtils';
import { basename } from '@utils/path';
import { useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
// Sibling-of-original-location import; fixed up after move into src/custom/.
import { useUpdateMapModified } from '@components/world/map/editors/useUpdateMapModified';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
`;

const HelperText = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  padding-top: 4px;
`;

/**
 * Single-column list of tilesets — each row a name + delete affordance.
 * Background matches Studio's text inputs (dark20) so it reads as a
 * "data field" rather than a callout panel.
 */
/** Positioning context for the floating hover preview (anchored to its left). */
const TilesetSectionBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TilesetList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  overflow: hidden;
`;

const TilesetListRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark18};
  }
`;

const TilesetRowName = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Red asterisk to match Studio's `Label required` convention. */
const RequiredStar = styled.span`
  color: ${({ theme }) => theme.colors.dangerBase};
  ${({ theme }) => theme.fonts.normalRegular};
`;

const TrashBtn = styled.button`
  all: unset;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text400};
  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

const MissingTag = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
  font-size: 11px;
`;

/** Combobox-style tileset picker — a single text input acts as both
 *  search and trigger. When focused (or typed in), the list below shows
 *  filtered candidates. Click one to add. Replaces the previous
 *  two-field design (search input + separate dropdown) that made the
 *  user choose where to type. */
const AddTilesetWrap = styled.div`
  margin-top: 8px;
  position: relative;
`;

const AddTilesetPopup = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
`;

const AddTilesetOption = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
  &:hover { background-color: ${({ theme }) => theme.colors.dark18}; }
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.dark14}; }
`;

/**
 * Floating image preview shown while a candidate is hovered — a small thumbnail
 * per row is too tiny to read, so the whole tileset renders large here instead.
 *
 * `position: fixed` + a portal to document.body + a top-of-stack z-index so it
 * is never clipped by the dialog's `overflow` or trapped in a lower stacking
 * context. Positioned from the hovered row's screen rect (see `previewPos`).
 */
const HoverPreview = styled.div`
  position: fixed;
  z-index: 2147483000;
  pointer-events: none;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const HoverPreviewName = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddTilesetEmpty = styled.div`
  padding: 6px 10px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
`;

/**
 * PSDK-convention mandatory tilesets that every map must reference.
 * Pattern arrays are tried in order — first .tsx that matches in the
 * project's Tilesets folder is the one we use.
 */
const REQUIRED_TILESETS = [
  { role: 'Passages', patterns: [/^passages\.tsx$/i] },
  { role: 'System tags', patterns: [/^systemtags?\.tsx$/i, /^system[_-]?tags?\.tsx$/i] },
  { role: 'Terrain tags', patterns: [/^terrain[_-]?tags?\.tsx$/i] },
] as const;

type TilesetEntry = {
  /** Role label shown for required rows; null for user-added extras (we show the .tsx filename instead). */
  role: string | null;
  /** .tsx filename — for required rows this is what we matched in the folder, null if missing. */
  tsxFilename: string | null;
  /** Tile count from the .tsx — used to stagger firstgids in the generated .tmx. */
  tilecount: number;
  /** True for the three mandatory PSDK tilesets; required → can't remove. */
  required: boolean;
};

const extractTilecountFromTsx = (xmlText: string): number => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) return 0;
  return parseInt(doc.documentElement.getAttribute('tilecount') ?? '0', 10) || 0;
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-]/g, '')
    .slice(0, 64) || 'map';

/**
 * Build a minimal Tiled .tmx for a (w × h) 32px-tile map with the given
 * mandatory tileset references already wired in. libtiled recomputes
 * `firstgid` on load anyway, but we stagger them by each tileset's real
 * tilecount so the on-disk file opens cleanly in desktop Tiled too.
 */
const buildBlankTmx = (width: number, height: number, tilesets: TilesetEntry[]): string => {
  // New maps ship with the standard PSDK layer skeleton so the user can
  // start painting immediately on `ground`, with `mid` / `top` ready for
  // upper-tile overlays and the `infos` group prepared for gameplay
  // metadata layers (passages / systemtags / terrain_tag / a spare
  // systemtags_bridge1 for bridge crossings). The order below matters:
  // libtiled renders earlier siblings first (bottom in stack), so we
  // list ground-most last so it appears at the top of the LayerList
  // panel (which mirrors render-stack convention).
  //
  // Empty <data encoding="csv"> rows are required — without them the
  // bridge's first toVariant() may emit the layer with no data array,
  // which makes the first paint silently no-op (we fix it on rebuild,
  // but emitting a real CSV up front avoids the dance).
  const tilesetRefs: string[] = [];
  let firstgid = 1;
  for (const t of tilesets) {
    if (!t.tsxFilename) continue;
    tilesetRefs.push(
      ` <tileset firstgid="${firstgid}" source="../Tilesets/${t.tsxFilename}"/>`,
    );
    firstgid += Math.max(1, t.tilecount);
  }
  // Precomputed CSV body of all-zero cells — used by every default layer.
  // One row per map row; trailing newline is what Tiled emits too.
  const csvRows = Array.from({ length: height }, () => Array(width).fill('0').join(','));
  const csvBody = csvRows.join(',\n');
  // Layer IDs need to be unique across the file. nextlayerid is set to
  // the value AFTER the last id we allocate below so future bridge-
  // assigned ids don't collide with anything we wrote.
  let nextId = 1;
  const tileLayer = (name: string) => {
    const id = nextId++;
    return [
      `  <layer id="${id}" name="${name}" width="${width}" height="${height}">`,
      `   <data encoding="csv">`,
      csvBody,
      `</data>`,
      `  </layer>`,
    ].join('\n');
  };
  const groupOpen = (name: string) => {
    const id = nextId++;
    return ` <group id="${id}" name="${name}">`;
  };
  // File order: earlier siblings render BELOW later ones, and the
  // LayerList panel mirrors render-stack convention (later in file =
  // top of list). So we emit ground → mid → top → infos so that
  // `infos` ends up at the TOP of the panel as the user expects,
  // sitting visually over the z=3 top layer.
  const layerSkeleton = [
    groupOpen('z=1'),
    tileLayer('ground'),
    ` </group>`,
    groupOpen('z=2'),
    tileLayer('mid'),
    ` </group>`,
    groupOpen('z=3'),
    tileLayer('top'),
    ` </group>`,
    // System / metadata group last (top of panel). Holds the four
    // gameplay-metadata tile layers in one collapsible bundle so a
    // single eye-toggle hides the whole overlay.
    //
    // Child file order is REVERSED from how the panel shows them
    // (later sibling = higher in panel). So to display
    //   systemtags
    //   systemtags_bridge1
    //   terrain_tag
    //   passages
    // top-to-bottom, we emit them in the opposite order in the .tmx.
    groupOpen('infos'),
    tileLayer('passages'),
    tileLayer('terrain_tag'),
    tileLayer('systemtags_bridge1'),
    tileLayer('systemtags'),
    ` </group>`,
  ];
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<map version="1.10" tiledversion="1.12.1" orientation="orthogonal" renderorder="right-down" compressionlevel="0" width="${width}" height="${height}" tilewidth="32" tileheight="32" infinite="0" nextlayerid="${nextId}" nextobjectid="1">`,
    ...tilesetRefs,
    ...layerSkeleton,
    `</map>`,
  ].join('\n');
};

type MapNewEditorProps = {
  closeDialog: () => void;
  mapInfoParent?: StudioMapInfoValue;
};

export const MapNewEditor = forwardRef<EditorHandlingClose, MapNewEditorProps>(({ closeDialog, mapInfoParent }, ref) => {
  const { projectDataValues: maps, setProjectDataValues: setMap, state } = useProjectMaps();
  const { projectDataValues: mapLinks, setProjectDataValues: setMapLink } = useProjectMapLinks();
  const { mapInfo, setMapInfo } = useMapInfo();
  const [globalState] = useGlobalState();
  const updateMapModified = useUpdateMapModified();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setText = useSetProjectText();
  const mapCopy = useMapCopy();
  const loaderRef = useLoaderRef();
  const [name, setName] = useState('');
  const [stepsAverage, setStepsAverage] = useState(30);
  const [tiledFilename, setTiledFilename] = useState('');
  const [mapWidth, setMapWidth] = useState<number>(20);
  const [mapHeight, setMapHeight] = useState<number>(15);
  const [bgm, setBgm] = useState('');
  const [bgs, setBgs] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState(false);
  // Search box for the "+ Add tileset" picker. Plain substring match,
  // case-insensitive — long projects can have 50+ .tsx files and the
  // dropdown alone becomes painful to scan.
  const [tilesetSearch, setTilesetSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  // The tileset whose large image previews on hover, plus the screen rect of the
  // row it's anchored to (so the portal-rendered preview can position itself).
  const [hovered, setHovered] = useState<{ tsx: string; rect: DOMRect } | null>(null);
  const pickerWrapRef = useRef<HTMLDivElement>(null);
  // Click-outside closes the popup. Mounted only while open so we don't
  // hold the listener for the dialog's whole lifetime.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (pickerWrapRef.current && !pickerWrapRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  // ---- Tilesets state -----------------------------------------------
  // Required ones (Passages / System tags / Terrain tags) are seeded
  // first; user-added extras append to the same array. Required entries
  // can't be removed (their cards omit the × button). Each entry caches
  // its tilecount + a blob: URL of its image preview.
  const [tilesets, setTilesets] = useState<TilesetEntry[]>(
    REQUIRED_TILESETS.map((r) => ({ role: r.role, tsxFilename: null, tilecount: 0, required: true })),
  );
  // All .tsx filenames found in the project (for the "add extra" dropdown).
  const [availableTilesets, setAvailableTilesets] = useState<string[]>([]);

  /**
   * Pull just the tilecount out of a .tsx — we need it so the generated
   * .tmx can stagger firstgids correctly between tilesets. No image
   * fetch (we don't preview anymore).
   */
  const hydrateTilesetTilecount = (projectPath: string, tsxFilename: string, apply: (tilecount: number) => void) => {
    window.api.readTilesetBytes(
      { projectPath, tsxFilename },
      ({ bytes }) => apply(extractTilecountFromTsx(new TextDecoder().decode(bytes))),
      () => { /* tsx unreadable; leave tilecount at 0, firstgid stagger will still work (treated as 1) */ },
    );
  };

  useEffect(() => {
    if (!globalState.projectPath) return;
    const projectPath = globalState.projectPath;
    const folderPath = `${projectPath.replaceAll('\\', '/')}/Data/Tiled/Tilesets`;
    window.api.getFilePathsFromFolder(
      { folderPath, extensions: ['.tsx'], isFileNameOnly: true },
      ({ filePaths }) => {
        const files = filePaths.sort();
        setAvailableTilesets(files);
        const seeded: TilesetEntry[] = REQUIRED_TILESETS.map((r) => ({
          role: r.role,
          tsxFilename: files.find((f) => r.patterns.some((p) => p.test(f))) ?? null,
          tilecount: 0,
          required: true,
        }));
        setTilesets(seeded);
        seeded.forEach((entry, idx) => {
          if (!entry.tsxFilename) return;
          hydrateTilesetTilecount(projectPath, entry.tsxFilename, (tilecount) => {
            setTilesets((cur) => cur.map((c, i) => (i === idx ? { ...c, tilecount } : c)));
          });
        });
      },
      () => { /* folder unreadable */ },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalState.projectPath]);

  const addExtraTileset = (tsxFilename: string) => {
    if (!globalState.projectPath || !tsxFilename) return;
    if (tilesets.some((t) => t.tsxFilename === tsxFilename)) return;
    const projectPath = globalState.projectPath;
    setTilesets((cur) => [...cur, { role: null, tsxFilename, tilecount: 0, required: false }]);
    hydrateTilesetTilecount(projectPath, tsxFilename, (tilecount) => {
      setTilesets((cur) => cur.map((c) => (!c.required && c.tsxFilename === tsxFilename ? { ...c, tilecount } : c)));
    });
  };

  const removeExtraTileset = (tsxFilename: string) => {
    setTilesets((cur) => cur.filter((c) => c.required || c.tsxFilename !== tsxFilename));
  };

  // .tsx files that are valid candidates for the "+ add tileset" picker —
  // exclude ones already in the list (required matches + already-added extras).
  const addCandidates = useMemo(() => {
    const taken = new Set(tilesets.map((t) => t.tsxFilename).filter(Boolean) as string[]);
    return availableTilesets.filter((f) => !taken.has(f));
  }, [availableTilesets, tilesets]);

  const filteredAddCandidates = useMemo(() => {
    const q = tilesetSearch.trim().toLowerCase();
    if (!q) return addCandidates;
    return addCandidates.filter((f) => f.toLowerCase().includes(q));
  }, [addCandidates, tilesetSearch]);

  useEditorHandlingClose(ref);

  const importingMap = !!tiledFilename;
  const sizeRequired = !importingMap;
  const sizeValid = !sizeRequired || (mapWidth >= 1 && mapHeight >= 1 && !isNaN(mapWidth) && !isNaN(mapHeight));

  const checkDisabled = () => {
    if (!name) return true;
    if (stepsAverage < 1 || stepsAverage > 999 || isNaN(stepsAverage)) return true;
    if (!sizeValid) return true;
    if (busy) return true;
    return false;
  };

  const persistNewMap = (effectiveTiledFilename: string) => {
    if (!descriptionRef.current) return;
    const audioBgm = { name: bgm, volume: 100, pitch: 100 };
    const audioBgs = { name: bgs, volume: 100, pitch: 100 };
    const newMap = createMap(maps, stepsAverage, basename(effectiveTiledFilename, '.tmx'), audioBgm, audioBgs);
    const dbSymbol = newMap.dbSymbol;
    if (mapInfoParent) {
      const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: mapInfoParent.id }) as StudioMapInfoMap;
      setMapInfo(mapInfoNewMapWithParent(mapInfo, mapInfoParent.id, newMapInfoMap));
    } else {
      const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: 0 }) as StudioMapInfoMap;
      setMapInfo(addNewMapInfo(mapInfo, newMapInfoMap));
    }
    if (effectiveTiledFilename !== '') {
      const mapModifiedUpdated = cloneEntity(state.mapsModified);
      mapModifiedUpdated.push(dbSymbol);
      updateMapModified(mapModifiedUpdated);
    }
    const mapLink = createMapLinkFromMainMapId(mapLinks, newMap.id);
    setMapLink({ [mapLink.dbSymbol]: mapLink });
    setText(MAP_NAME_TEXT_ID, newMap.id, name);
    setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, descriptionRef.current.value);
    setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
    closeDialog();
    // Jump straight into the map editor (the "Map" tab) so the user can
    // start drawing immediately. Previously this landed on /world/map
    // (the Data tab), forcing an extra click. /world/overview is the
    // Map-tab route registered by the Studio fork.
    navigate('/world/overview');
  };

  const onClickCreate = () => {
    if (!name || !descriptionRef.current) return;
    if (importingMap) {
      persistNewMap(tiledFilename);
      return;
    }
    if (!globalState.projectPath) {
      setError('No project loaded.');
      return;
    }
    const slug = slugify(name);
    if (Object.values(maps).some((m) => m.tiledFilename === slug)) {
      setError(`A map with the file name "${slug}.tmx" already exists. Rename your map or import the existing file instead.`);
      return;
    }
    const xml = buildBlankTmx(Math.floor(mapWidth), Math.floor(mapHeight), tilesets);
    const bytes = new TextEncoder().encode(xml);
    setBusy(true);
    setError('');
    window.api.writeMapBytes(
      {
        projectPath: globalState.projectPath,
        tiledFilename: slug,
        bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      },
      () => {
        setBusy(false);
        persistNewMap(slug);
      },
      ({ errorMessage }) => {
        setBusy(false);
        setError(errorMessage);
      },
    );
  };

  const onChangeStepsAverage = (value: string) => {
    const n = value === '' ? NaN : Number(value);
    setStepsAverage(n);
  };

  const copyTmxFile = (tmxFile: string) => {
    setError('');
    mapCopy(
      { tmxFile },
      () => {
        loaderRef.current.close();
        setTiledFilename(tmxFile);
      },
      (errorMessage) => {
        loaderRef.current.close();
        setError(errorMessage);
      },
      (genericError) => {
        setTimeout(() => loaderRef.current.setError('importing_tiled_maps_error', genericError, true), 200);
        closeDialog();
      },
    );
  };

  const tilesetSection = (
    <InputWithTopLabelContainer>
      <Label>{t('tilesets')}</Label>
      <TilesetSectionBody onMouseLeave={() => setHovered(null)}>
        {/* Large image preview of the hovered tileset. Portaled to document.body
            with position:fixed so it floats above EVERYTHING — never clipped by
            the dialog's overflow or a lower stacking context. Positioned to the
            left of the hovered row, flipping to the right if there's no room. */}
        {globalState.projectPath && hovered && createPortal(
          (() => {
            const PREVIEW_W = 276;
            const PREVIEW_H = 300;
            const gap = 10;
            let left = hovered.rect.left - PREVIEW_W - gap;
            if (left < 8) left = Math.min(window.innerWidth - PREVIEW_W - 8, hovered.rect.right + gap);
            const top = Math.max(8, Math.min(hovered.rect.top, window.innerHeight - PREVIEW_H - 8));
            return (
              <HoverPreview style={{ left, top }}>
                <TilesetThumb projectPath={globalState.projectPath} tsxFilename={hovered.tsx} width={260} height={260} />
                <HoverPreviewName>{hovered.tsx}</HoverPreviewName>
              </HoverPreview>
            );
          })(),
          document.body,
        )}
        <TilesetList>
          {tilesets.map((ts) => (
            <TilesetListRow
              key={`${ts.required ? `req:${ts.role}` : `extra:${ts.tsxFilename}`}`}
              onMouseEnter={(e) => ts.tsxFilename && setHovered({ tsx: ts.tsxFilename, rect: e.currentTarget.getBoundingClientRect() })}
            >
              <TilesetRowName>
                {ts.required && <RequiredStar>*</RequiredStar>}
                <span>{ts.role ?? ts.tsxFilename ?? 'unknown'}</span>
                {ts.required && !ts.tsxFilename && <MissingTag>not found</MissingTag>}
              </TilesetRowName>
              {!ts.required && ts.tsxFilename && (
                <TrashBtn
                  title="Remove this tileset"
                  onClick={() => removeExtraTileset(ts.tsxFilename!)}
                  aria-label="Remove tileset"
                >🗑</TrashBtn>
              )}
            </TilesetListRow>
          ))}
        </TilesetList>
        {addCandidates.length > 0 && (
          <AddTilesetWrap ref={pickerWrapRef}>
            {/* Single combobox: the text input IS the search field AND
                opens the candidate list. Typing filters; clicking a row
                adds it + clears the input + closes the popup. */}
            <Input
              type="text"
              name="tileset-search"
              value={tilesetSearch}
              placeholder={t('search_tileset')}
              onFocus={() => setPickerOpen(true)}
              onChange={(e) => { setTilesetSearch(e.target.value); setPickerOpen(true); }}
            />
            {pickerOpen && (
              <AddTilesetPopup>
                {filteredAddCandidates.length > 0 ? (
                  filteredAddCandidates.map((f) => (
                    <AddTilesetOption
                      key={f}
                      type="button"
                      onMouseEnter={(e) => setHovered({ tsx: f, rect: e.currentTarget.getBoundingClientRect() })}
                      onClick={() => {
                        addExtraTileset(f);
                        setTilesetSearch('');
                        setPickerOpen(false);
                        setHovered(null);
                      }}
                    >
                      <span>{f}</span>
                    </AddTilesetOption>
                  ))
                ) : (
                  <AddTilesetEmpty>{t('no_tileset_match')}</AddTilesetEmpty>
                )}
              </AddTilesetPopup>
            )}
          </AddTilesetWrap>
        )}
      </TilesetSectionBody>
    </InputWithTopLabelContainer>
  );

  return (
    <EditorWithCollapse type="creation" title={t('new_map')}>
      <InputContainer size="l">
        {/* ---- Info (no collapse) ---- */}
        <PaddedInputContainer size="m">
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('name')}
            </Label>
            <Input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_map')} />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="descr">{t('description')}</Label>
            <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description_map')} />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>

        {/* ---- Data ---- */}
        <InputGroupCollapse title={t('data')} noMargin>
          <InputWithLeftLabelContainer>
            <Label htmlFor="map-w" required={sizeRequired}>{t('width')}</Label>
            <Input
              type="number"
              name="map-w"
              min="1"
              max="999"
              value={isNaN(mapWidth) ? '' : mapWidth}
              disabled={importingMap}
              onChange={(e) => setMapWidth(e.target.value === '' ? NaN : Number(e.target.value))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="map-h" required={sizeRequired}>{t('height')}</Label>
            <Input
              type="number"
              name="map-h"
              min="1"
              max="999"
              value={isNaN(mapHeight) ? '' : mapHeight}
              disabled={importingMap}
              onChange={(e) => setMapHeight(e.target.value === '' ? NaN : Number(e.target.value))}
            />
          </InputWithLeftLabelContainer>
          {importingMap && <HelperText>{t('map_size_from_tiled')}</HelperText>}

          <InputWithLeftLabelContainer>
            <Label htmlFor="steps-average" required>
              {t('steps_average')}
            </Label>
            <Input
              type="number"
              name="steps-average"
              min="1"
              max="999"
              value={isNaN(stepsAverage) ? '' : stepsAverage}
              onChange={(event) => onChangeStepsAverage(event.target.value)}
            />
          </InputWithLeftLabelContainer>

          <InputWithTopLabelContainer>
            <Label htmlFor="tiled-file">{t('map_made_tiled')}</Label>
            {!tiledFilename ? (
              <DropInput name={t('tiled_file')} extensions={['tmx']} onFileChoosen={copyTmxFile} showAcceptedFormat />
            ) : (
              <FileInput
                filePath={`Data/Tiled/Maps/${basename(tiledFilename, '.tmx')}.tmx`}
                name={t('tiled_file')}
                extensions={['tmx']}
                onFileChoosen={copyTmxFile}
                onFileClear={() => {
                  setTiledFilename('');
                  setError('');
                }}
                noIcon
              />
            )}
          </InputWithTopLabelContainer>

          {tilesetSection}
        </InputGroupCollapse>

        {/* ---- Musics ---- */}
        <InputGroupCollapse title={t('musics')} noMargin>
          <InputWithTopLabelContainer>
            <Label htmlFor="bgm">{t('background_music')}</Label>
            {!bgm ? (
              <DropInput
                name={t('background_music_file')}
                extensions={AUDIO_EXT}
                destFolderToCopy="audio/bgm"
                onFileChoosen={(filePath) => setBgm(basename(filePath))}
              />
            ) : (
              <FileInput
                filePath={`audio/bgm/${bgm}`}
                name={t('background_music_file')}
                extensions={AUDIO_EXT}
                onFileChoosen={(filePath) => setBgm(basename(filePath))}
                onFileClear={() => setBgm('')}
                noIcon
              />
            )}
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="bgs">{t('background_sound')}</Label>
            {!bgs ? (
              <DropInput
                name={t('background_sound_file')}
                extensions={AUDIO_EXT}
                destFolderToCopy="audio/bgs"
                onFileChoosen={(filePath) => setBgs(basename(filePath))}
              />
            ) : (
              <FileInput
                filePath={`audio/bgs/${bgs}`}
                name={t('background_sound_file')}
                extensions={AUDIO_EXT}
                onFileChoosen={(filePath) => setBgs(basename(filePath))}
                onFileClear={() => setBgs('')}
                noIcon
              />
            )}
          </InputWithTopLabelContainer>
        </InputGroupCollapse>

        {error && <TextInputError>{error}</TextInputError>}

        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickCreate} disabled={checkDisabled()}>
              {busy ? '…' : t('create')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog} disabled={busy}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
});
MapNewEditor.displayName = 'MapNewEditor';
