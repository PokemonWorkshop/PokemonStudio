/**
 * Modal: add a tileset reference to the current map.
 *
 * Two entry paths, surfaced inside the same modal:
 *
 *   1. "From tileset image…" (top of the list) — opens an OS file picker
 *      for a PNG/JPG, then asks the user for name + tile size + optional
 *      transparent color. The image is copied to Data/Tiled/Assets/ and a
 *      fresh .tsx is generated at Data/Tiled/Tilesets/<name>.tsx. We then
 *      forward to the same onConfirm path as branch 2 with the new .tsx
 *      filename, so the map's .tmx XML gets a `<tileset source=...>`
 *      reference exactly like an existing tileset.
 *
 *   2. Pick an existing .tsx — original behavior. Lists all .tsx files
 *      under Data/Tiled/Tilesets/ and inserts a reference to the chosen one.
 *
 * Conflict policy is intentionally strict (see createTilesetFromImage
 * backend): we refuse to overwrite a .tsx or asset of the same name. The
 * user picked this in the questionnaire so they wouldn't accidentally
 * clobber a tileset another map references.
 */

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  width: min(560px, 90vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};
`;

const Body = styled.div`
  flex: 1;
  overflow: auto;
  padding: 8px 0;
`;

const SearchInput = styled.input`
  width: calc(100% - 32px);
  margin: 8px 16px;
  padding: 8px 10px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

const FileRow = styled.button<{ $selected: boolean; $disabled: boolean }>`
  all: unset;
  display: block;
  width: calc(100% - 32px);
  margin: 0 16px;
  padding: 8px 10px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  color: ${({ $selected, $disabled, theme }) =>
    $disabled ? theme.colors.text500 : $selected ? theme.colors.text100 : theme.colors.text400};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.dark23 : 'transparent')};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.normalSmall};

  &:hover {
    background-color: ${({ $selected, $disabled, theme }) =>
      $disabled ? 'transparent' : $selected ? theme.colors.dark23 : theme.colors.dark18};
  }
`;

const FromImageRow = styled(FileRow)`
  color: ${({ theme }) => theme.colors.primaryBase};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  margin-bottom: 6px;
  padding-bottom: 10px;
  border-radius: 4px 4px 0 0;
`;

const Empty = styled.div`
  padding: 16px;
  text-align: center;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
`;

const Footer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark14};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px 12px;
  padding: 16px;
  align-items: center;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
`;

const FormLabel = styled.label`
  color: ${({ theme }) => theme.colors.text400};
`;

const TextInput = styled.input`
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primaryBase}; }
`;

const NumberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NumberInput = styled(TextInput)`
  width: 80px;
`;

const Inline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorSwatch = styled.input`
  width: 36px;
  height: 28px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
`;

const FormError = styled.div`
  grid-column: 1 / -1;
  color: ${({ theme }) => theme.colors.dangerBase};
  ${({ theme }) => theme.fonts.normalSmall};
`;

const PickedPath = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  word-break: break-all;
`;

type Props = {
  projectPath: string;
  /** Filenames (with `.tsx`) already referenced by the map — shown disabled. */
  alreadyAdded: Set<string>;
  onCancel: () => void;
  onConfirm: (tsxFilename: string) => void;
};

type ImageDims = { width: number; height: number };

/** Load an image off the filesystem path to read its pixel dimensions. */
const loadImageDims = (filePath: string): Promise<ImageDims> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Could not read image dimensions for ${filePath}`));
    // Electron's file:// loader is the simplest cross-platform path here.
    // Backslashes need to become forward slashes for the URL.
    img.src = `file://${filePath.replaceAll('\\', '/')}`;
  });
};

/** Strip extension + sanitize for use as a tileset / filename. */
const deriveDefaultName = (imagePath: string): string => {
  const base = imagePath.split(/[\\/]/).pop() ?? 'tileset';
  const stem = base.replace(/\.[^.]+$/, '');
  return stem.replace(/[\\/:*?"<>|]/g, '_').trim() || 'tileset';
};

export const AddTilesetDialog: React.FC<Props> = ({
  projectPath, alreadyAdded, onCancel, onConfirm,
}) => {
  const [files, setFiles] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sub-form state for the "From tileset image…" branch. When `imagePath`
  // is set we render the form instead of the file list.
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<ImageDims | null>(null);
  const [name, setName] = useState('');
  const [tileW, setTileW] = useState('32');
  const [tileH, setTileH] = useState('32');
  const [useTrans, setUseTrans] = useState(false);
  const [transColor, setTransColor] = useState('#ff00ff');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const folderPath = `${projectPath.replaceAll('\\', '/')}/Data/Tiled/Tilesets`;
    window.api.getFilePathsFromFolder(
      { folderPath, extensions: ['.tsx'], isFileNameOnly: true },
      (payload) => setFiles(payload.filePaths.sort()),
      (e) => setError(e.errorMessage),
    );
  }, [projectPath]);

  const filtered = useMemo(() => {
    if (!files) return [];
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.toLowerCase().includes(q));
  }, [files, search]);

  const onPickImage = () => {
    window.api.chooseFile(
      { name: 'Tileset image', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif'] },
      async ({ path: chosen }) => {
        setFormError(null);
        setImagePath(chosen);
        setName(deriveDefaultName(chosen));
        try {
          const dims = await loadImageDims(chosen);
          setImageDims(dims);
        } catch (e) {
          setFormError((e as Error).message);
          setImageDims(null);
        }
      },
      () => { /* user cancelled — stay on the list */ },
    );
  };

  const closeForm = () => {
    setImagePath(null);
    setImageDims(null);
    setName('');
    setTileW('32');
    setTileH('32');
    setUseTrans(false);
    setTransColor('#ff00ff');
    setFormError(null);
    setSubmitting(false);
  };

  const onCreateFromImage = () => {
    if (!imagePath || !imageDims) return;
    const trimmedName = name.trim();
    const tw = parseInt(tileW, 10);
    const th = parseInt(tileH, 10);
    if (!trimmedName) { setFormError('Name is required.'); return; }
    if (!Number.isFinite(tw) || tw <= 0) { setFormError('Tile width must be a positive number.'); return; }
    if (!Number.isFinite(th) || th <= 0) { setFormError('Tile height must be a positive number.'); return; }
    if (alreadyAdded.has(`${trimmedName}.tsx`)) {
      setFormError(`This map already references "${trimmedName}.tsx".`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    window.api.createTilesetFromImage(
      {
        projectPath,
        srcImagePath: imagePath,
        name: trimmedName,
        tilewidth: tw,
        tileheight: th,
        imageWidth: imageDims.width,
        imageHeight: imageDims.height,
        // Tiled expects lowercase hex w/o '#'.
        trans: useTrans ? transColor.replace('#', '').toLowerCase() : undefined,
      },
      ({ tsxFilename }) => onConfirm(tsxFilename),
      (e) => {
        setFormError(e.errorMessage);
        setSubmitting(false);
      },
    );
  };

  // Sub-form view ----------------------------------------------------------
  if (imagePath) {
    return (
      <Backdrop onClick={onCancel}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>New tileset from image</Header>
          <Body>
            <FormGrid>
              <FormLabel>Image</FormLabel>
              <PickedPath title={imagePath}>{imagePath}</PickedPath>

              <FormLabel>Dimensions</FormLabel>
              <div>{imageDims ? `${imageDims.width} × ${imageDims.height} px` : 'reading…'}</div>

              <FormLabel htmlFor="ts-name">Name</FormLabel>
              <TextInput
                id="ts-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MyTileset"
              />

              <FormLabel>Tile size</FormLabel>
              <NumberRow>
                <NumberInput
                  type="number"
                  min={1}
                  value={tileW}
                  onChange={(e) => setTileW(e.target.value)}
                />
                <span>×</span>
                <NumberInput
                  type="number"
                  min={1}
                  value={tileH}
                  onChange={(e) => setTileH(e.target.value)}
                />
                <span>px</span>
              </NumberRow>

              <FormLabel>Transparent color</FormLabel>
              <Inline>
                <input
                  type="checkbox"
                  checked={useTrans}
                  onChange={(e) => setUseTrans(e.target.checked)}
                  id="ts-trans-on"
                />
                <ColorSwatch
                  type="color"
                  value={transColor}
                  disabled={!useTrans}
                  onChange={(e) => setTransColor(e.target.value)}
                />
                <span>{useTrans ? transColor : 'none'}</span>
              </Inline>

              {formError && <FormError>{formError}</FormError>}
            </FormGrid>
          </Body>
          <Footer>
            <DarkButton onClick={closeForm} disabled={submitting}>Back</DarkButton>
            <DarkButton onClick={onCancel} disabled={submitting}>Cancel</DarkButton>
            <PrimaryButton onClick={onCreateFromImage} disabled={submitting || !imageDims}>
              {submitting ? 'Creating…' : 'Create tileset'}
            </PrimaryButton>
          </Footer>
        </Modal>
      </Backdrop>
    );
  }

  // List view --------------------------------------------------------------
  return (
    <Backdrop onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>Add tileset to map</Header>
        <SearchInput
          autoFocus
          placeholder="Filter by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Body>
          <FromImageRow
            $selected={false}
            $disabled={false}
            onClick={onPickImage}
            title="Pick a PNG/JPG and generate a new .tsx for it"
          >
            ＋ From tileset image…
          </FromImageRow>
          {!files && !error && <Empty>Reading Data/Tiled/Tilesets…</Empty>}
          {error && <Empty>Error: {error}</Empty>}
          {files && filtered.length === 0 && <Empty>No matching tilesets.</Empty>}
          {filtered.map((entry) => {
            const isAdded = alreadyAdded.has(entry);
            return (
              <FileRow
                key={entry}
                $selected={selected === entry}
                $disabled={isAdded}
                onClick={() => !isAdded && setSelected(entry)}
                onDoubleClick={() => !isAdded && (setSelected(entry), onConfirm(entry))}
                title={isAdded ? 'Already in this map' : entry}
              >
                {entry}{isAdded ? ' · already added' : ''}
              </FileRow>
            );
          })}
        </Body>
        <Footer>
          <DarkButton onClick={onCancel}>Cancel</DarkButton>
          <PrimaryButton
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected || alreadyAdded.has(selected)}
          >
            Add tileset
          </PrimaryButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
};
