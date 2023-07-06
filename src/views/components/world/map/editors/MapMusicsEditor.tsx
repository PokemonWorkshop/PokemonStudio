import React, { forwardRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { useMapPage } from '@utils/usePage';
import { useUpdateMap } from './useUpdateMap';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { FileInput, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { AUDIO_EXT } from '@components/inputs/AudioInput';

export const MapMusicsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_maps');
  const { map } = useMapPage();
  const updateMap = useUpdateMap(map);
  const [bgm, setBgm] = useState<string>(map.bgm);
  const [bgs, setBgs] = useState<string>(map.bgs);

  const onClose = () => {
    updateMap({ bgm, bgs });
  };
  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('musics')}>
      <InputContainer>
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
      </InputContainer>
    </Editor>
  );
});
MapMusicsEditor.displayName = 'MapMusicsEditor';
