import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useConfigLanguage, useConfigSceneTitle } from '@utils/useProjectConfig';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from '../DashboardEditor';
import { Input, InputWithTopLabelContainer, InputWithLeftLabelContainer, Label, Toggle, InputContainer, AudioInput } from '@components/inputs';
import { join, basename } from '@utils/path';
import { DropInput } from '@components/inputs/DropInput';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cloneEntity } from '@utils/cloneEntity';
import { AUDIO_EXT } from '@components/inputs/AudioInput';

const DurationInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const DurationContainer = styled(InputWithLeftLabelContainer)`
  & > ${Input}, & > div > ${Input} {
    width: 110px;
  }
`;

export const DashboardGameStartTitleScreen = () => {
  const { t } = useTranslation('dashboard_game_start');
  const { projectConfigValues: gameStart, setProjectConfigValues: setGameStart } = useConfigSceneTitle();
  const { projectConfigValues: language } = useConfigLanguage();
  const currentEditedGameStart = useMemo(() => cloneEntity(gameStart), [gameStart]);
  const [titleScreenData, setTitleScreenData] = useState({ duration: gameStart.bgmDuration, controlWaitTime: gameStart.controlWaitTime });

  const onMusicChoosen = (musicPath: string) => {
    const musicFilename = basename(musicPath);
    currentEditedGameStart.bgmName = join('audio/bgm', musicFilename).replaceAll('\\', '/');
    setGameStart(currentEditedGameStart);
  };

  const onMusicClear = () => {
    currentEditedGameStart.bgmName = '';
    setGameStart(currentEditedGameStart);
  };

  const onChangeDuration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseInt(event.target.value);
    if (duration < 0 || duration > 999_999_999) return event.preventDefault();
    setTitleScreenData({ ...titleScreenData, duration });
  };

  const onBlurDuration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const duration = cleanNaNValue(parseInt(event.target.value), 0);
    if (duration < 0 || duration > 999_999_999) return event.preventDefault();
    currentEditedGameStart.bgmDuration = duration;
    setGameStart(currentEditedGameStart);
  };

  const onChangeControlWaitTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    const controlWaitTime = parseFloat(event.target.value);
    if (controlWaitTime < 0 || controlWaitTime > 9999.9) return event.preventDefault();
    setTitleScreenData({ ...titleScreenData, controlWaitTime });
  };

  const onBlurControlWaitTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    const controlWaitTime = cleanNaNValue(parseFloat(event.target.value), 0);
    if (controlWaitTime < 0 || controlWaitTime > 9999.9) return event.preventDefault();
    currentEditedGameStart.controlWaitTime = controlWaitTime;
    setGameStart(currentEditedGameStart);
  };

  return (
    <DashboardEditor editorTitle={t('game_start')} title={t('title_screen')}>
      {language.choosableLanguageCode.length > 1 && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="show-language-selection">{t('show_language_selection')}</Label>
          <Toggle
            name="show-language-selection"
            checked={gameStart.isLanguageSelectionEnabled}
            onChange={(event) => {
              currentEditedGameStart.isLanguageSelectionEnabled = event.target.checked;
              setGameStart(currentEditedGameStart);
            }}
          />
        </InputWithLeftLabelContainer>
      )}
      <InputWithTopLabelContainer>
        <Label htmlFor="music">{t('music')}</Label>
        {gameStart.bgmName.length === 0 ? (
          <DropInput destFolderToCopy="audio/bgm" name={t('title_screen_music')} extensions={AUDIO_EXT} onFileChoosen={onMusicChoosen} />
        ) : (
          <AudioInput
            audioPathInProject={gameStart.bgmName}
            destFolderToCopy="audio/bgm"
            name={t('title_screen_music')}
            extensions={AUDIO_EXT}
            onAudioChoosen={onMusicChoosen}
            onAudioClear={onMusicClear}
          />
        )}
      </InputWithTopLabelContainer>
      <InputContainer size="s">
        <DurationContainer>
          <Label htmlFor="music-duration">{t('music_duration')}</Label>
          <Input
            type="number"
            name="music-duration"
            min="0"
            max="999999999"
            value={isNaN(titleScreenData.duration) ? '' : titleScreenData.duration}
            onChange={onChangeDuration}
            onBlur={onBlurDuration}
            placeholder="0"
          />
        </DurationContainer>
        <DurationInfoContainer>{t('duration_info')}</DurationInfoContainer>
      </InputContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="control-wait-time">{t('control_wait_time')}</Label>
        <EmbeddedUnitInput
          unit="s"
          lang="en"
          type="number"
          name="control-wait-time"
          min="0"
          max="9999.9"
          step="0.1"
          value={isNaN(titleScreenData.controlWaitTime) ? '' : titleScreenData.controlWaitTime}
          onChange={onChangeControlWaitTime}
          onBlur={onBlurControlWaitTime}
          placeholder="0"
        />
      </InputWithLeftLabelContainer>
    </DashboardEditor>
  );
};
