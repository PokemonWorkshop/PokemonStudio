import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputWithLeftLabelContainer, Input, Label, Toggle, InputContainer } from '@components/inputs';
import { DashboardEditor } from './DashboardEditor';
import { useConfigSettings } from '@utils/useProjectConfig';
import styled from 'styled-components';
import { cleaningSettingsNaNValues } from '@utils/cleanNaNValue';
import { cloneEntity } from '@utils/cloneEntity';

const UnlimitedItemsInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const DashboardSettings = () => {
  const { t } = useTranslation('dashboard_settings');
  const { projectConfigValues: settings, setProjectConfigValues: setSettings } = useConfigSettings();
  const [maxLevel, setMaxLevel] = useState(settings.pokemonMaxLevel);
  const [maxItemCount, setMaxBagItemCount] = useState(settings.maxBagItemCount);
  const currentEditedSettings = useMemo(() => cloneEntity(settings), [settings]);

  const updateSettingsConfig = () => {
    cleaningSettingsNaNValues(currentEditedSettings);
    setMaxLevel(currentEditedSettings.pokemonMaxLevel);
    setMaxBagItemCount(currentEditedSettings.maxBagItemCount);
    setSettings(currentEditedSettings);
  };

  const onChangeMaxLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(event.target.value);
    if (level < 1 || level > 9999) return event.preventDefault();
    setMaxLevel(level);
  };

  const onBlurMaxLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(event.target.value);
    if (level < 1 || level > 9999) return event.preventDefault();
    currentEditedSettings.pokemonMaxLevel = level;
    updateSettingsConfig();
  };

  const onChangeMaxBagItemCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxBagItem = parseInt(event.target.value);
    if (maxBagItem < 0 || maxBagItem > 9999) return event.preventDefault();
    setMaxBagItemCount(maxBagItem);
  };

  const onBlurMaxBagItemCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxBagItem = parseInt(event.target.value);
    if (maxBagItem < 0 || maxBagItem > 9999) return event.preventDefault();
    currentEditedSettings.maxBagItemCount = maxBagItem;
    updateSettingsConfig();
  };

  return (
    <DashboardEditor editorTitle={t('settings')} title={t('general')}>
      <InputWithLeftLabelContainer>
        <Label htmlFor="max-level">{t('max_pokemon_level')}</Label>
        <Input
          type="number"
          name="max-level"
          min="1"
          max="9999"
          value={isNaN(maxLevel) ? '' : maxLevel}
          onChange={onChangeMaxLevel}
          onBlur={onBlurMaxLevel}
          placeholder="100"
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label>{t('evolution_form')}</Label>
        <Toggle
          name="evolution_form"
          checked={settings.isAlwaysUseForm0ForEvolution}
          onChange={(event) => {
            currentEditedSettings.isAlwaysUseForm0ForEvolution = event.target.checked;
            setSettings(currentEditedSettings);
          }}
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label>{t('evolution_form_no_data')}</Label>
        <Toggle
          name="evolution_form_no_data"
          checked={settings.isUseForm0WhenNoEvolutionData}
          onChange={(event) => {
            currentEditedSettings.isUseForm0WhenNoEvolutionData = event.target.checked;
            setSettings(currentEditedSettings);
          }}
        />
      </InputWithLeftLabelContainer>
      <InputContainer size="s">
        <InputWithLeftLabelContainer>
          <Label htmlFor="max-bag-item-count">{t('max_bag_item_count')}</Label>
          <Input
            type="number"
            name="max-bag-item-count"
            min="0"
            max="9999"
            value={isNaN(maxItemCount) ? '' : maxItemCount}
            onChange={onChangeMaxBagItemCount}
            onBlur={onBlurMaxBagItemCount}
            placeholder="99"
          />
        </InputWithLeftLabelContainer>
        <UnlimitedItemsInfoContainer>{t('unlimited_items')}</UnlimitedItemsInfoContainer>
      </InputContainer>
    </DashboardEditor>
  );
};
