import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle, Input } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { useConfigDisplay } from '@utils/useProjectConfig';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cleaningDisplayNaNValues } from '@utils/cleanNaNValue';
import { cloneEntity } from '@utils/cloneEntity';

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text400};
`;

const InputWithInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResolutionInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const InputSizes = styled(EmbeddedUnitInput)`
  text-align: left;
  min-width: 0px;
`;

const EditorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DashboardDisplay = () => {
  const { t } = useTranslation('dashboard_display');
  const { projectConfigValues: display, setProjectConfigValues: setDisplay } = useConfigDisplay();
  const currentEditedDisplay = useMemo(() => cloneEntity(display), [display]);
  const [resolution, setResolution] = useState(currentEditedDisplay.gameResolution);
  const [windowScale, setWindowScale] = useState(currentEditedDisplay.windowScale);
  const [tilemapClass, setTilemapClass] = useState(currentEditedDisplay.tilemapSettings.tilemapClass);
  const [tilemapSize, setTilemapSize] = useState(currentEditedDisplay.tilemapSettings.tilemapSize);
  const [tileZoom, setTileZoom] = useState(currentEditedDisplay.tilemapSettings.characterTileZoom);
  const [characterZoom, setCharacterZoom] = useState(currentEditedDisplay.tilemapSettings.characterSpriteZoom);
  const [framePerAnimation, setFramePerAnimation] = useState(currentEditedDisplay.tilemapSettings.autotileIdleFrameCount);

  const updateDisplayConfig = () => {
    cleaningDisplayNaNValues(currentEditedDisplay);
    setResolution({ ...currentEditedDisplay.gameResolution });
    setWindowScale(currentEditedDisplay.windowScale);
    setTilemapSize({ ...currentEditedDisplay.tilemapSettings.tilemapSize });
    setTilemapClass(currentEditedDisplay.tilemapSettings.tilemapClass);
    setTileZoom(currentEditedDisplay.tilemapSettings.characterTileZoom);
    setCharacterZoom(currentEditedDisplay.tilemapSettings.characterSpriteZoom);
    setFramePerAnimation(currentEditedDisplay.tilemapSettings.autotileIdleFrameCount);
    setDisplay(currentEditedDisplay);
  };

  const onChangeWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 9999) return event.preventDefault();
    setResolution({ ...currentEditedDisplay.gameResolution, x: value });
  };

  const onBlurWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 9999) return event.preventDefault();
    currentEditedDisplay.gameResolution = { ...currentEditedDisplay.gameResolution, x: value };
    updateDisplayConfig();
  };

  const onChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 9999) return event.preventDefault();
    setResolution({ ...currentEditedDisplay.gameResolution, y: value });
  };

  const onBlurHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 9999) return event.preventDefault();
    currentEditedDisplay.gameResolution = { ...currentEditedDisplay.gameResolution, y: value };
    updateDisplayConfig();
  };

  const onChangeWindowScale = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    setWindowScale(value);
  };

  const onBlurWindowScale = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 9999) return event.preventDefault();
    currentEditedDisplay.windowScale = value;
    updateDisplayConfig();
  };

  const onChangeTilemapWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    setTilemapSize({ ...currentEditedDisplay.tilemapSettings.tilemapSize, x: value });
  };

  const onBlurTilemapWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    currentEditedDisplay.tilemapSettings.tilemapSize = { ...currentEditedDisplay.tilemapSettings.tilemapSize, x: value };
    updateDisplayConfig();
  };

  const onChangeTileClass = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTilemapClass(event.target.value);
  };

  const onBlurTileClass = (event: React.ChangeEvent<HTMLInputElement>) => {
    currentEditedDisplay.tilemapSettings.tilemapClass = event.target.value.length === 0 ? 'Yuki::Tilemap16px' : event.target.value;
    updateDisplayConfig();
  };

  const onChangeTilemapHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    setTilemapSize({ ...currentEditedDisplay.tilemapSettings.tilemapSize, y: value });
  };

  const onBlurTilemapHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    currentEditedDisplay.tilemapSettings.tilemapSize = { ...currentEditedDisplay.tilemapSettings.tilemapSize, y: value };
    updateDisplayConfig();
  };

  const onChangeTileZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = +parseFloat(event.target.value).toFixed(1);
    if (value < 0.5 || value > 99) return event.preventDefault();
    setTileZoom(value);
  };

  const onBlurTileZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = +parseFloat(event.target.value).toFixed(1);
    if (value < 0.5 || value > 99) return event.preventDefault();
    currentEditedDisplay.tilemapSettings.characterTileZoom = value;
    updateDisplayConfig();
  };

  const onChangeCharacterZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = +parseFloat(event.target.value).toFixed(1);
    if (value < 0.5 || value > 99) return event.preventDefault();
    setCharacterZoom(value);
  };

  const onBlurCharacterZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = +parseFloat(event.target.value).toFixed(1);
    if (value < 0.5 || value > 99) return event.preventDefault();
    currentEditedDisplay.tilemapSettings.characterSpriteZoom = value;
    updateDisplayConfig();
  };

  const onChangeFPA = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    setFramePerAnimation(value);
  };

  const onBlurFPA = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    currentEditedDisplay.tilemapSettings.autotileIdleFrameCount = value;
    updateDisplayConfig();
  };

  return (
    <EditorsContainer>
      <DashboardEditor editorTitle={t('display')} title={t('resolution')}>
        <InputWithInfoContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="width">{t('game_resolution')}</Label>
            <InputContainer>
              <InputSizes
                unit="px"
                type="number"
                name="width"
                min="1"
                max="9999"
                value={isNaN(resolution.x) ? '' : resolution.x}
                onChange={onChangeWidth}
                onBlur={onBlurWidth}
                placeholder="320"
              />
              x
              <InputSizes
                unit="px"
                type="number"
                name="height"
                min="1"
                max="9999"
                value={isNaN(resolution.y) ? '' : resolution.y}
                onChange={onChangeHeight}
                onBlur={onBlurHeight}
                placeholder="240"
              />
            </InputContainer>
          </InputWithLeftLabelContainer>
          <ResolutionInfoContainer>{t('game_resolution_advice')}</ResolutionInfoContainer>
        </InputWithInfoContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="window_scale">{t('window_scale')}</Label>
          <Input
            type="number"
            name="window_scale"
            min="1"
            max="99"
            value={isNaN(windowScale) ? '' : windowScale}
            onChange={onChangeWindowScale}
            onBlur={onBlurWindowScale}
            placeholder="1"
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="full_screen">{t('full_screen')}</Label>
          <Toggle
            name="full_screen"
            checked={currentEditedDisplay.isFullscreen}
            onChange={(event) => {
              currentEditedDisplay.isFullscreen = event.target.checked;
              setDisplay(currentEditedDisplay);
            }}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="player_centered">{t('game_window_centered')}</Label>
          <Toggle
            name="player_centered"
            checked={currentEditedDisplay.isPlayerAlwaysCentered}
            onChange={(event) => {
              currentEditedDisplay.isPlayerAlwaysCentered = event.target.checked;
              setDisplay(currentEditedDisplay);
            }}
          />
        </InputWithLeftLabelContainer>
      </DashboardEditor>
      <DashboardEditor editorTitle={t('display')} title={t('tilemap')}>
        <InputWithTopLabelContainer>
          <Label htmlFor="tileClass">{t('class')}</Label>
          <Input
            type="text"
            name="tileClass"
            value={tilemapClass}
            onChange={onChangeTileClass}
            onBlur={onBlurTileClass}
            placeholder="Yuki::Tilemap16px"
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="size_x">{t('tilemap_size')}</Label>
          <InputContainer>
            <Input
              type="number"
              name="size_x"
              min="1"
              max="99"
              value={isNaN(tilemapSize.x) ? '' : tilemapSize.x}
              onChange={onChangeTilemapWidth}
              onBlur={onBlurTilemapWidth}
              placeholder="22"
            />
            x
            <Input
              type="number"
              name="size_y"
              min="1"
              max="99"
              value={isNaN(tilemapSize.y) ? '' : tilemapSize.y}
              onChange={onChangeTilemapHeight}
              onBlur={onBlurTilemapHeight}
              placeholder="17"
            />
          </InputContainer>
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="tileZoom">{t('tile_zoom')}</Label>
          <Input
            type="number"
            name="tileZoom"
            min="0.5"
            max="99"
            step="0.1"
            value={isNaN(tileZoom) ? '' : tileZoom}
            onChange={onChangeTileZoom}
            onBlur={onBlurTileZoom}
            placeholder="0.5"
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="characterZoom">{t('scale_characters')}</Label>
          <Input
            type="number"
            name="characterZoom"
            min="0.5"
            max="99"
            step="0.1"
            value={isNaN(characterZoom) ? '' : characterZoom}
            onChange={onChangeCharacterZoom}
            onBlur={onBlurCharacterZoom}
            placeholder="0.5"
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="framePerAnimation">{t('images_per_animation')}</Label>
          <Input
            type="number"
            name="framePerAnimation"
            min="1"
            max="99"
            value={isNaN(framePerAnimation) ? '' : framePerAnimation}
            onChange={onChangeFPA}
            onBlur={onBlurFPA}
            placeholder="1"
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="old_map_linker">{t('old_map_linker')}</Label>
          <Toggle
            name="old_map_linker"
            checked={currentEditedDisplay.tilemapSettings.isOldMaplinker}
            onChange={(event) => {
              currentEditedDisplay.tilemapSettings.isOldMaplinker = event.target.checked;
              setDisplay(currentEditedDisplay);
            }}
          />
        </InputWithLeftLabelContainer>
      </DashboardEditor>
    </EditorsContainer>
  );
};
