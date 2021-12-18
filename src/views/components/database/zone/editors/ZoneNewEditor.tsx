import React, { useState } from 'react';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import ZoneModel from '@modelEntities/zone/Zone.model';
import { useProjectZones } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 0 0;
  gap: 8px;
`;

type ZoneNewEditorProps = {
  onClose: () => void;
};

export const ZoneNewEditor = ({ onClose }: ZoneNewEditorProps) => {
  const { projectDataValues: zones, setProjectDataValues: setZone, bindProjectDataValue: bindZone } = useProjectZones();
  const { t } = useTranslation('database_zones');
  const [newZone] = useState(bindZone(ZoneModel.createZone(zones)));
  const [zoneText, setZoneText] = useState({ name: '', descr: '' });
  const refreshUI = useRefreshUI();

  const onClickNew = () => {
    newZone.setName(zoneText.name);
    newZone.setDescr(zoneText.descr);
    setZone({ [newZone.dbSymbol]: newZone }, { zone: newZone.dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={zoneText.name}
            onChange={(event) => refreshUI(setZoneText({ ...zoneText, name: event.target.value }))}
            placeholder={t('example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput
            id="descr"
            value={zoneText.descr}
            onChange={(event) => refreshUI(setZoneText({ ...zoneText, descr: event.target.value }))}
            placeholder={t('example_descr')}
          />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {zoneText.name.length === 0 && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={zoneText.name.length === 0}>
              {t('create_zone')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
