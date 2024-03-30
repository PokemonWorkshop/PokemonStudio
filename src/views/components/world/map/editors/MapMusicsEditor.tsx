import React, { forwardRef, useState } from 'react';
import { EditorWithCollapse } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { useMapPage } from '@utils/usePage';
import { useUpdateMap } from './useUpdateMap';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { FileInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { StudioMapMusic } from '@modelEntities/map';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';

export const MapMusicsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_maps');
  const { map } = useMapPage();
  const updateMap = useUpdateMap(map);
  const [bgm, setBgm] = useState<StudioMapMusic>(map.bgm);
  const [bgs, setBgs] = useState<StudioMapMusic>(map.bgs);

  const onChangeValue = (type: 'bgm' | 'bgs', key: 'volume' | 'pitch', value: string) => {
    const newValue = value === '' ? NaN : Number(value);
    if (type === 'bgm') return setBgm({ ...bgm, [key]: newValue });

    return setBgs({ ...bgs, [key]: newValue });
  };

  const canClose = () => {
    if (bgm.volume < 0 || bgm.volume > 100 || bgm.pitch < 50 || bgm.pitch > 150) return false;
    if (bgs.volume < 0 || bgs.volume > 100 || bgs.pitch < 50 || bgs.pitch > 150) return false;

    return true;
  };

  const onClose = () => {
    updateMap({
      bgm: {
        ...bgm,
        volume: isNaN(bgm.volume) ? map.bgm.volume : bgm.volume,
        pitch: isNaN(bgm.pitch) ? map.bgm.pitch : bgm.pitch,
      },
      bgs: {
        ...bgs,
        volume: isNaN(bgs.volume) ? map.bgs.volume : bgs.volume,
        pitch: isNaN(bgs.pitch) ? map.bgs.pitch : bgs.pitch,
      },
    });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t('musics')}>
      <InputContainer size="s">
        <InputGroupCollapse title={t('background_music')} collapseByDefault={true}>
          <InputContainer size="m">
            <InputWithTopLabelContainer>
              <Label htmlFor="bgm">{t('background_music_file')}</Label>
              {!bgm.name ? (
                <DropInput
                  name={t('background_music_file')}
                  extensions={AUDIO_EXT}
                  destFolderToCopy="audio/bgm"
                  onFileChoosen={(filePath) => setBgm({ ...bgm, name: basename(filePath) })}
                />
              ) : (
                <FileInput
                  filePath={`audio/bgm/${bgm.name}`}
                  name={t('background_music_file')}
                  extensions={AUDIO_EXT}
                  onFileChoosen={(filePath) => setBgm({ ...bgm, name: basename(filePath) })}
                  onFileClear={() => setBgm({ ...bgm, name: '', volume: 100, pitch: 100 })}
                  noIcon
                />
              )}
            </InputWithTopLabelContainer>
            {bgm.name && (
              <>
                <InputWithLeftLabelContainer>
                  <Label htmlFor="volume-bgm">{t('volume')}</Label>
                  <EmbeddedUnitInput
                    name="volume-bgm"
                    min="0"
                    max="100"
                    unit="%"
                    value={isNaN(bgm.volume) ? '' : bgm.volume}
                    onChange={(event) => onChangeValue('bgm', 'volume', event.target.value)}
                  />
                </InputWithLeftLabelContainer>
                <InputWithLeftLabelContainer>
                  <Label htmlFor="pitch-bgm">{t('pitch')}</Label>
                  <EmbeddedUnitInput
                    type="number"
                    name="pitch-bgm"
                    min="50"
                    max="150"
                    unit="%"
                    value={isNaN(bgm.pitch) ? '' : bgm.pitch}
                    onChange={(event) => onChangeValue('bgm', 'pitch', event.target.value)}
                  />
                </InputWithLeftLabelContainer>
              </>
            )}
          </InputContainer>
        </InputGroupCollapse>
        <InputGroupCollapse title={t('background_sound')} collapseByDefault={true} noMargin>
          <InputContainer size="m">
            <InputWithTopLabelContainer>
              <Label htmlFor="bgs">{t('background_sound_file')}</Label>
              {!bgs.name ? (
                <DropInput
                  name={t('background_sound_file')}
                  extensions={AUDIO_EXT}
                  destFolderToCopy="audio/bgs"
                  onFileChoosen={(filePath) => setBgs({ ...bgs, name: basename(filePath) })}
                />
              ) : (
                <FileInput
                  filePath={`audio/bgs/${bgs.name}`}
                  name={t('background_sound_file')}
                  extensions={AUDIO_EXT}
                  onFileChoosen={(filePath) => setBgs({ ...bgs, name: basename(filePath) })}
                  onFileClear={() => setBgs({ ...bgs, name: '', volume: 100, pitch: 100 })}
                  noIcon
                />
              )}
            </InputWithTopLabelContainer>
            {bgs.name && (
              <>
                <InputWithLeftLabelContainer>
                  <Label htmlFor="volume-bgs">{t('volume')}</Label>
                  <EmbeddedUnitInput
                    type="number"
                    name="volume-bgs"
                    min="0"
                    max="100"
                    unit="%"
                    value={isNaN(bgs.volume) ? '' : bgs.volume}
                    onChange={(event) => onChangeValue('bgs', 'volume', event.target.value)}
                  />
                </InputWithLeftLabelContainer>
                <InputWithLeftLabelContainer>
                  <Label htmlFor="pitch-bgs">{t('pitch')}</Label>
                  <EmbeddedUnitInput
                    type="number"
                    name="pitch-bgs"
                    min="50"
                    max="150"
                    unit="%"
                    value={isNaN(bgs.pitch) ? '' : bgs.pitch}
                    onChange={(event) => onChangeValue('bgs', 'pitch', event.target.value)}
                  />
                </InputWithLeftLabelContainer>
              </>
            )}
          </InputContainer>
        </InputGroupCollapse>
      </InputContainer>
    </EditorWithCollapse>
  );
});
MapMusicsEditor.displayName = 'MapMusicsEditor';
