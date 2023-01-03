import React, { useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import styled from 'styled-components';
import { SelectGroup } from '@components/selects';
import { useProjectGroups } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioGroup } from '@modelEntities/group';

const BattlerImportInfo = styled.div`
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

type GroupBattlerImportEditorProps = {
  group: StudioGroup;
  onClose: () => void;
};

export const GroupBattlerImportEditor = ({ group, onClose }: GroupBattlerImportEditorProps) => {
  const { projectDataValues: groups, setProjectDataValues: setGroup } = useProjectGroups();
  const firstDbSymbol = Object.entries(groups)
    .map(([value, groupData]) => ({ value, index: groupData.id }))
    .filter((d) => d.value !== group.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedGroup, setSelectedGroup] = useState(firstDbSymbol);
  const { t } = useTranslation('database_groups');
  const [override, setOverride] = useState(false);
  const refreshUI = useRefreshUI();

  const onClickImport = () => {
    if (override) group.encounters = cloneEntity(groups[selectedGroup].encounters);
    else group.encounters.push(...cloneEntity(groups[selectedGroup].encounters));
    setGroup({ [group.dbSymbol]: group });
    onClose();
  };

  return (
    <Editor type="group" title={t('import')}>
      <InputContainer size="m">
        <BattlerImportInfo>{t('battler_import_info')}</BattlerImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="group">{t('import_battler_from')}</Label>
          <SelectGroup dbSymbol={selectedGroup} onChange={(selected) => setSelectedGroup(selected.value)} rejected={[group.dbSymbol]} noLabel />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_battlers')}</Label>
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
