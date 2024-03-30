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
  const [bgmName, setBgmName] = useState<string>(map.bgm.name);
  const [bgsName, setBgsName] = useState<string>(map.bgs.name);

  const onClose = () => {
    updateMap({
      bgm: {
        ...map.bgm,
        name: bgmName,
      },
      bgs: {
        ...map.bgs,
        name: bgsName,
      },
    });
  };
  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('musics')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="bgm">{t('background_music')}</Label>
          {!bgmName ? (
            <DropInput
              name={t('background_music_file')}
              extensions={AUDIO_EXT}
              destFolderToCopy="audio/bgm"
              onFileChoosen={(filePath) => setBgmName(basename(filePath))}
            />
          ) : (
            <FileInput
              filePath={`audio/bgm/${bgmName}`}
              name={t('background_music_file')}
              extensions={AUDIO_EXT}
              onFileChoosen={(filePath) => setBgmName(basename(filePath))}
              onFileClear={() => setBgmName('')}
              noIcon
            />
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="bgs">{t('background_sound')}</Label>
          {!bgsName ? (
            <DropInput
              name={t('background_sound_file')}
              extensions={AUDIO_EXT}
              destFolderToCopy="audio/bgs"
              onFileChoosen={(filePath) => setBgsName(basename(filePath))}
            />
          ) : (
            <FileInput
              filePath={`audio/bgs/${bgsName}`}
              name={t('background_sound_file')}
              extensions={AUDIO_EXT}
              onFileChoosen={(filePath) => setBgsName(basename(filePath))}
              onFileClear={() => setBgsName('')}
              noIcon
            />
          )}
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
});
MapMusicsEditor.displayName = 'MapMusicsEditor';
