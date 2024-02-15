import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorWithCollapse } from '@components/editor';
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
import { useProjectMaps } from '@utils/useProjectData';
import styled from 'styled-components';
import { DarkButton, PrimaryButton, SecondaryButton } from '@components/buttons';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { createMap, createMapInfo } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { useNavigate } from 'react-router-dom';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { cloneEntity } from '@utils/cloneEntity';
import { useMapInfo } from '@utils/useMapInfo';
import { StudioMapInfoMap, StudioMapInfoValue } from '@modelEntities/mapInfo';
import { addNewMapInfo, mapInfoNewMapWithParent } from '@utils/MapInfoUtils';
import { EditorChildWithSubEditorContainer, SubEditorContainer, SubEditorSeparator } from '@components/editor/EditorContainer';
import { MapImportEditorTitle, MapImportOverlay } from './MapImport/MapImportOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useUpdateMapModified } from './useUpdateMapModified';
import { useMapCopy } from '@utils/useMapCopy';
import { useLoaderRef } from '@utils/loaderContext';
import { TextInputError } from '@components/inputs/Input';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 24px;
`;

type MapNewEditorProps = {
  closeDialog: () => void;
  mapInfoParent?: StudioMapInfoValue;
};

export const MapNewEditor = forwardRef<EditorHandlingClose, MapNewEditorProps>(({ closeDialog, mapInfoParent }, ref) => {
  const { projectDataValues: maps, setProjectDataValues: setMap, state } = useProjectMaps();
  const { mapInfo, setMapInfo } = useMapInfo();
  const updateMapModified = useUpdateMapModified();
  const { t } = useTranslation(['database_moves', 'database_maps']);
  const dialogsRef = useDialogsRef<MapImportEditorTitle>();
  const navigate = useNavigate();
  const setText = useSetProjectText();
  const mapCopy = useMapCopy();
  const loaderRef = useLoaderRef();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [stepsAverage, setStepsAverage] = useState(30);
  const [tiledFilename, setTiledFilename] = useState('');
  const [bgm, setBgm] = useState('');
  const [bgs, setBgs] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string>('');

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!name || !descriptionRef.current) return;

    const newMap = createMap(maps, stepsAverage, basename(tiledFilename, '.tmx'), bgm, bgs);
    const dbSymbol = newMap.dbSymbol;
    if (mapInfoParent) {
      const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: mapInfoParent.id }) as StudioMapInfoMap;
      setMapInfo(mapInfoNewMapWithParent(mapInfo, mapInfoParent.id, newMapInfoMap));
    } else {
      const newMapInfoMap = createMapInfo(mapInfo, { klass: 'MapInfoMap', mapDbSymbol: dbSymbol, parentId: 0 }) as StudioMapInfoMap;
      setMapInfo(addNewMapInfo(mapInfo, newMapInfoMap));
    }
    if (tiledFilename !== '') {
      const mapModifiedUpdated = cloneEntity(state.mapsModified);
      mapModifiedUpdated.push(dbSymbol);
      updateMapModified(mapModifiedUpdated);
    }

    setText(MAP_NAME_TEXT_ID, newMap.id, name);
    setText(MAP_DESCRIPTION_TEXT_ID, newMap.id, descriptionRef.current.value);
    setMap({ [dbSymbol]: newMap }, { map: dbSymbol });
    closeDialog();
    navigate('/world/map');
  };

  const checkDisabled = () => {
    return !name || stepsAverage < 1 || stepsAverage > 999 || isNaN(stepsAverage);
  };

  const onChangeStepsAverage = (value: string) => {
    const stepsAverage = value === '' ? NaN : Number(value);
    setStepsAverage(stepsAverage);
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
      }
    );
  };

  return (
    <EditorWithCollapse type="creation" title={t('database_maps:new')}>
      <EditorChildWithSubEditorContainer>
        <InputContainer size="l">
          <PaddedInputContainer size="m">
            <InputWithTopLabelContainer>
              <Label htmlFor="name" required>
                {t('database_maps:name')}
              </Label>
              <Input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('database_maps:example_name')}
              />
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="descr">{t('database_maps:description')}</Label>
              <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('database_maps:example_description')} />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="steps-average" required>
                {t('database_maps:steps_average')}
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
              <Label htmlFor="tiled-file">{t('database_maps:map_made_tiled')}</Label>
              {!tiledFilename ? (
                <DropInput name={t('database_maps:tiled_file')} extensions={['tmx']} onFileChoosen={copyTmxFile} showAcceptedFormat />
              ) : (
                <FileInput
                  filePath={`Data/Tiled/Maps/${basename(tiledFilename, '.tmx')}.tmx`}
                  name={t('database_maps:tiled_file')}
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
          </PaddedInputContainer>
          <InputGroupCollapse title={t('database_maps:musics')} noMargin>
            <InputWithTopLabelContainer>
              <Label htmlFor="bgm">{t('database_maps:background_music')}</Label>
              {!bgm ? (
                <DropInput
                  name={t('database_maps:background_music_file')}
                  extensions={AUDIO_EXT}
                  destFolderToCopy="audio/bgm"
                  onFileChoosen={(filePath) => setBgm(basename(filePath))}
                />
              ) : (
                <FileInput
                  filePath={`audio/bgm/${bgm}`}
                  name={t('database_maps:background_music_file')}
                  extensions={AUDIO_EXT}
                  onFileChoosen={(filePath) => setBgm(basename(filePath))}
                  onFileClear={() => setBgm('')}
                  noIcon
                />
              )}
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label htmlFor="bgs">{t('database_maps:background_sound')}</Label>
              {!bgs ? (
                <DropInput
                  name={t('database_maps:background_sound_file')}
                  extensions={AUDIO_EXT}
                  destFolderToCopy="audio/bgs"
                  onFileChoosen={(filePath) => setBgs(basename(filePath))}
                />
              ) : (
                <FileInput
                  filePath={`audio/bgs/${bgs}`}
                  name={t('database_maps:background_sound_file')}
                  extensions={AUDIO_EXT}
                  onFileChoosen={(filePath) => setBgs(basename(filePath))}
                  onFileClear={() => setBgs('')}
                  noIcon
                />
              )}
              {error && <TextInputError>{error}</TextInputError>}
            </InputWithTopLabelContainer>
          </InputGroupCollapse>
          <ButtonContainer>
            <ToolTipContainer>
              {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
              <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
                {t('database_maps:create_map')}
              </PrimaryButton>
            </ToolTipContainer>
            <DarkButton onClick={closeDialog}>{t('database_moves:cancel')}</DarkButton>
          </ButtonContainer>
        </InputContainer>
        <SubEditorContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="importation" title={t('database_maps:import_tiled_maps')}>
            <SecondaryButton onClick={() => dialogsRef.current?.openDialog('import', true)}>{t('database_maps:import')}</SecondaryButton>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
      <MapImportOverlay ref={dialogsRef} closeParentDialog={closeDialog} />
    </EditorWithCollapse>
  );
});
MapNewEditor.displayName = 'MapNewEditor';
