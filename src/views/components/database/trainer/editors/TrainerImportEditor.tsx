import React, { useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import styled from 'styled-components';
import { SelectTrainer } from '@components/selects';
import { useProjectTrainers } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { reduceBagEntries, StudioTrainer } from '@modelEntities/trainer';
import { cloneEntity } from '@utils/cloneEntity';

const TrainerImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type TrainerImportEditorProps = {
  trainer: StudioTrainer;
  type: 'battler' | 'item';
  onClose: () => void;
};

export const TrainerImportEditor = ({ trainer, type, onClose }: TrainerImportEditorProps) => {
  const { projectDataValues: trainers, setProjectDataValues: setTrainer } = useProjectTrainers();
  const firstDbSymbol = Object.entries(trainers)
    .map(([value, trainerData]) => ({ value, index: trainerData.id }))
    .filter((d) => d.value !== trainer.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedTrainer, setSelectedTrainer] = useState(firstDbSymbol);
  const { t } = useTranslation('database_trainers');
  const [override, setOverride] = useState(false);
  const refreshUI = useRefreshUI();

  const onClickImport = () => {
    if (type === 'battler') {
      if (override) trainer.party = cloneEntity(trainers[selectedTrainer].party);
      else trainer.party.push(...cloneEntity(trainers[selectedTrainer].party));
    } else {
      if (override) trainer.bagEntries = cloneEntity(trainers[selectedTrainer].bagEntries);
      else trainer.bagEntries.push(...cloneEntity(trainers[selectedTrainer].bagEntries));
      reduceBagEntries(trainer);
    }
    setTrainer({ [trainer.dbSymbol]: trainer });
    onClose();
  };

  return (
    <Editor type="trainer" title={t('import')}>
      <InputContainer size="m">
        <TrainerImportInfo>{type === 'battler' ? t('battler_import_info') : t('item_import_info')}</TrainerImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="trainer">{type === 'battler' ? t('import_battler_from') : t('import_item_from')}</Label>
          <SelectTrainer
            dbSymbol={selectedTrainer}
            onChange={(selected) => setSelectedTrainer(selected.value)}
            rejected={[trainer.dbSymbol]}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{type === 'battler' ? t('replace_battlers') : t('replace_items')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => refreshUI(setOverride(event.target.checked))} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
