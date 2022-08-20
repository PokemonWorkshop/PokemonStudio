import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputWithLeftLabelContainer, Input, Label, Toggle } from '@components/inputs';
import { DashboardEditor } from './DashboardEditor';
import { useConfigSettings } from '@utils/useProjectConfig';

export const DashboardSettings = () => {
  const { t } = useTranslation('dashboard_settings');
  const { projectConfigValues: settings, setProjectConfigValues: setSettings } = useConfigSettings();
  const [maxLevel, setMaxLevel] = useState(settings.pokemonMaxLevel);
  const currentEditedSettings = useMemo(() => settings.clone(), [settings]);

  const updateSettingsConfig = () => {
    currentEditedSettings.cleaningNaNValues();
    setMaxLevel(currentEditedSettings.pokemonMaxLevel);
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

  return (
    <DashboardEditor editorTitle={t('settings')} title={t('evolution')}>
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
    </DashboardEditor>
  );
};
