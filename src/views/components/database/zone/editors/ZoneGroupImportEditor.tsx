import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { SelectZone } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';

import { useProjectZones } from '@hooks/useProjectData';
import { useZonePage } from '@src/hooks/usePage';

import { cloneEntity } from '@utils/cloneEntity';

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
  closeDialog: () => void;
};

export const ZoneGroupImportEditor = forwardRef<EditorHandlingClose, ZoneGroupImportEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: zones, setProjectDataValues: setZone } = useProjectZones();
  const { t } = useTranslation();
  const { zone } = useZonePage();
  const firstDbSymbol = Object.entries(zones)
    .map(([value, zoneData]) => ({ value, index: zoneData.id }))
    .filter((data) => data.value !== zone.dbSymbol)
    .sort((a, b) => a.index - b.index)[0].value;
  const [selectedZone, setSelectedZone] = useState(firstDbSymbol);
  const [override, setOverride] = useState(false);

  const onClickImport = () => {
    const zoneEdited = cloneEntity(zone);
    if (override) zoneEdited.wildGroups = cloneEntity(zones[selectedZone].wildGroups);
    else zoneEdited.wildGroups.push(...cloneEntity(zones[selectedZone].wildGroups));
    setZone({ [zone.dbSymbol]: zoneEdited });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type="zone" title={t('import')}>
      <InputContainer size="m">
        <ZoneGroupImportInfo>{t('zone_group_import_info')}</ZoneGroupImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="zone">{t('import_group_from')}</Label>
          <SelectZone
            dbSymbol={selectedZone}
            onChange={(dbSymbol) => setSelectedZone(dbSymbol)}
            filter={(dbSymbol) => dbSymbol !== zone.dbSymbol}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_group')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => setOverride(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
ZoneGroupImportEditor.displayName = 'ZoneGroupImportEditor';
