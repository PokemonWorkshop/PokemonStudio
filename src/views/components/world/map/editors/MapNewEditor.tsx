import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorWithCollapse } from '@components/editor';
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
import { DarkButton, PrimaryButton } from '@components/buttons';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { MAP_DESCRIPTION_TEXT_ID, MAP_NAME_TEXT_ID } from '@modelEntities/map';
import { createMap } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { useNavigate } from 'react-router-dom';
import { AUDIO_EXT } from '@components/inputs/AudioInput';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type MapNewEditorProps = {
  closeDialog: () => void;
};

export const MapNewEditor = forwardRef<EditorHandlingClose, MapNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: maps, setProjectDataValues: setMap } = useProjectMaps();
  const { t } = useTranslation(['database_moves', 'database_maps']);
  const navigate = useNavigate();
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [stepsAverage, setStepsAverage] = useState(30);
  const [tiledFilename, setTiledFilename] = useState('');
  const [bgm, setBgm] = useState('');
  const [bgs, setBgs] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!name || !descriptionRef.current) return;

    const newMap = createMap(maps, stepsAverage, tiledFilename, bgm, bgs);
    const dbSymbol = newMap.dbSymbol;
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

  return (
    <EditorWithCollapse type="creation" title={t('database_maps:new')}>
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
        </PaddedInputContainer>
        <InputGroupCollapse title={t('database_maps:musics')} noMargin collapseByDefault>
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
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
        <InputGroupCollapse title={t('database_maps:advanced_settings')} noMargin collapseByDefault>
          <InputWithTopLabelContainer>
            <Label htmlFor="tiled-file">{t('database_maps:map_made_tiled')}</Label>
            {!tiledFilename ? (
              <DropInput
                name={t('database_maps:tiled_file')}
                extensions={['tmx']}
                destFolderToCopy="Data/Tiled"
                onFileChoosen={(filePath) => setTiledFilename(basename(filePath, '.tmx'))}
                showAcceptedFormat
              />
            ) : (
              <FileInput
                filePath={`Data/Tiled/${tiledFilename}.tmx`}
                name={t('database_maps:tiled_file')}
                extensions={['tmx']}
                onFileChoosen={(filePath) => setTiledFilename(basename(filePath, '.tmx'))}
                onFileClear={() => setTiledFilename('')}
                noIcon
              />
            )}
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
    </EditorWithCollapse>
  );
});
MapNewEditor.displayName = 'MapNewEditor';
