import React, { useMemo, useState } from 'react';
import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { useConfigSave } from '@utils/useProjectConfig';
import { cleaningSaveNaNValues, cleanNaNValue } from '@utils/cleanNaNValue';
import styled from 'styled-components';
import { cloneEntity } from '@utils/cloneEntity';

const Divider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const InputKey = styled(Input)`
  text-align: left;
`;

const HeaderInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const DashboardSave = () => {
  const { t } = useTranslation('dashboard_save');
  const { projectConfigValues: save, setProjectConfigValues: setSave } = useConfigSave();
  const currentEditedSave = useMemo(() => cloneEntity(save), [save]);
  const [filename, setFilename] = useState(currentEditedSave.baseFilename);
  const [header, setHeader] = useState(currentEditedSave.saveHeader);
  const [key, setKey] = useState(currentEditedSave.saveKey);
  const [maxSaves, setMaxSaves] = useState(currentEditedSave.maximumSave);

  const updateSaveConfig = () => {
    cleaningSaveNaNValues(currentEditedSave);
    setFilename(currentEditedSave.baseFilename);
    setHeader(currentEditedSave.saveHeader);
    setKey(currentEditedSave.saveKey);
    setMaxSaves(currentEditedSave.maximumSave);
    setSave(currentEditedSave);
  };

  const onChangeFilename = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };

  const onBlurFilename = (event: React.ChangeEvent<HTMLInputElement>) => {
    currentEditedSave.baseFilename = event.target.value.length === 0 ? 'Saves/Pokemon_Party' : event.target.value;
    updateSaveConfig();
  };

  const onChangeHeader = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeader(event.target.value);
  };

  const onBlurHeader = (event: React.ChangeEvent<HTMLInputElement>) => {
    currentEditedSave.saveHeader = event.target.value.length !== 5 ? currentEditedSave.saveHeader : event.target.value;
    updateSaveConfig();
  };

  const onChangeKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < -2147483648 || value > 2147483647) return event.preventDefault();
    setKey(value);
  };

  const onBlurKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < -2147483648 || value > 2147483647) return event.preventDefault();
    currentEditedSave.saveKey = value;
    updateSaveConfig();
  };

  const onChangeMax = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value < 1 || value > 99) return event.preventDefault();
    setMaxSaves(value);
  };

  const onBlurMax = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.length === 0 ? 1 : cleanNaNValue(parseInt(event.target.value), 1);
    if (value < 1 || value > 99) return event.preventDefault();
    currentEditedSave.maximumSave = value;
    updateSaveConfig();
  };

  return (
    <DashboardEditor title={t('settings')} editorTitle={t('save')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="base_filename">{t('save_filename')}</Label>
        <Input
          type="text"
          name="base_filename"
          value={filename}
          onChange={onChangeFilename}
          onBlur={onBlurFilename}
          placeholder="Saves/Pokemon_Party"
        />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="header">{t('save_header')}</Label>
        <Input type="text" name="header" value={header} onChange={onChangeHeader} onBlur={onBlurHeader} placeholder="PKPRT" maxLength={5} />
        <HeaderInfoContainer>{t('save_header_info')}</HeaderInfoContainer>
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="key">{t('save_key')}</Label>
        <InputKey type="number" name="key" value={isNaN(key) ? '' : key} onChange={onChangeKey} onBlur={onBlurKey} placeholder="0" />
      </InputWithTopLabelContainer>
      <Divider />
      <InputWithLeftLabelContainer>
        <Label htmlFor="save_anywhere">{t('save_any_location')}</Label>
        <Toggle
          name="save_anywhere"
          checked={currentEditedSave.isCanSaveOnAnySave}
          onChange={(event) => {
            currentEditedSave.isCanSaveOnAnySave = event.target.checked;
            setSave(currentEditedSave);
          }}
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="unlimited_saves">{t('save_unlimited_count')}</Label>
        <Toggle
          name="unlimited_saves"
          checked={currentEditedSave.maximumSave === 0}
          onChange={() => {
            currentEditedSave.maximumSave = currentEditedSave.maximumSave > 0 ? 0 : 1;
            updateSaveConfig();
          }}
        />
      </InputWithLeftLabelContainer>
      {!(currentEditedSave.maximumSave === 0) && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="max_saves">{t('save_max_count')}</Label>
          <Input type="number" name="max_saves" min="1" max="99" value={isNaN(maxSaves) ? '' : maxSaves} onChange={onChangeMax} onBlur={onBlurMax} />
        </InputWithLeftLabelContainer>
      )}
    </DashboardEditor>
  );
};
