import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useProjectZones } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { createZone } from '@utils/entityCreation';

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
  const { projectDataValues: zones, setProjectDataValues: setZone } = useProjectZones();
  const { t } = useTranslation('database_zones');
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const onClickNew = () => {
    if (!descriptionRef.current) return;

    const id = findFirstAvailableId(zones, 0);
    const dbSymbol = `zone_${id}` as DbSymbol;
    const zone = createZone(dbSymbol, id);
    setText(ZONE_NAME_TEXT_ID, id, name);
    setText(ZONE_DESCRIPTION_TEXT_ID, id, descriptionRef.current.value);
    setZone({ [dbSymbol]: zone }, { zone: dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_descr')} />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {!name && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={!name}>
              {t('create_zone')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
