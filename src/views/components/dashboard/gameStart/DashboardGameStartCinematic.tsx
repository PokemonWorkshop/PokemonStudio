import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigSceneTitle } from '@utils/useProjectConfig';
import { DashboardEditor } from '../DashboardEditor';
import { Input, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

export const DashboardGameStartCinematic = () => {
  const { t } = useTranslation('dashboard_game_start');
  const { projectConfigValues: gameStart, setProjectConfigValues: setGameStart } = useConfigSceneTitle();
  const currentEditedGameStart = useMemo(() => gameStart.clone(), [gameStart]);
  const [mapCinematicId, setMapCinematicId] = useState<number>(gameStart.introMovieMapId);

  const onChangeIntroMovieMapId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mapId = parseInt(event.target.value);
    if (mapId < 1 || mapId > 9999) return event.preventDefault();
    setMapCinematicId(mapId);
  };

  const onBlurIntroMovieMapId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mapId = cleanNaNValue(parseInt(event.target.value), 1);
    if (mapId < 1 || mapId > 9999) return event.preventDefault();
    currentEditedGameStart.introMovieMapId = mapId;
    setGameStart(currentEditedGameStart);
  };

  return (
    <DashboardEditor editorTitle={t('game_start')} title={t('cinematic')}>
      <InputWithLeftLabelContainer>
        <Label htmlFor="show_cinematic">{t('show_cinematic')}</Label>
        <Toggle
          name="show_cinematic"
          checked={gameStart.introMovieMapId !== 0}
          onChange={(event) => {
            currentEditedGameStart.introMovieMapId = event.target.checked ? 1 : 0;
            setMapCinematicId(currentEditedGameStart.introMovieMapId);
            setGameStart(currentEditedGameStart);
          }}
        />
      </InputWithLeftLabelContainer>
      {gameStart.introMovieMapId !== 0 && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="map_cinematic_id">{t('map_cinematic_id')}</Label>
          <Input
            type="number"
            name="map_cinematic_id"
            min="1"
            max="9999"
            value={isNaN(mapCinematicId) ? '' : mapCinematicId}
            onChange={onChangeIntroMovieMapId}
            onBlur={onBlurIntroMovieMapId}
            placeholder="1"
          />
        </InputWithLeftLabelContainer>
      )}
    </DashboardEditor>
  );
};
