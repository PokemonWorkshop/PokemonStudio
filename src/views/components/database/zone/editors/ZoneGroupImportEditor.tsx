import React, { useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import styled from 'styled-components';
import { SelectZone } from '@components/selects';
import { useProjectZones } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import ZoneModel from '@modelEntities/zone/Zone.model';

const ZoneGroupImportInfo = styled.div`
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

type ZoneGroupImportEditorProps = {
  zone: ZoneModel;
  onClose: () => void;
};

export const ZoneGroupImportEditor = ({ zone, onClose }: ZoneGroupImportEditorProps) => {
  const { projectDataValues: zones, setProjectDataValues: setZone } = useProjectZones();
  const firstDbSymbol = Object.entries(zones)
    .map(([value, zoneData]) => ({ value, index: zoneData.id }))
    .filter((d) => d.value !== zone.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedZone, setSelectedZone] = useState(firstDbSymbol);
  const { t } = useTranslation('database_zones');
  const [override, setOverride] = useState(false);
  const refreshUI = useRefreshUI();

  const onClickImport = () => {
    if (override) zone.wildGroups = zones[selectedZone].clone().wildGroups;
    else zone.wildGroups.push(...zones[selectedZone].clone().wildGroups);
    setZone({ [zone.dbSymbol]: zone });
    onClose();
  };

  return (
    <Editor type="zone" title={t('import')}>
      <InputContainer size="m">
        <ZoneGroupImportInfo>{t('zone_group_import_info')}</ZoneGroupImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="zone">{t('import_group_from')}</Label>
          <SelectZone dbSymbol={selectedZone} onChange={(selected) => setSelectedZone(selected.value)} rejected={[zone.dbSymbol]} noLabel />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_group')}</Label>
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
