import React, { forwardRef, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';

import { useProjectZones } from '@hooks/useProjectData';

import { ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { useSetProjectText } from '@utils/ReadingProjectText';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { createZone } from '@utils/entityCreation';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 0 0;
  gap: 8px;
`;

type ZoneNewEditorProps = {
  closeDialog: () => void;
};

export const ZoneNewEditor = forwardRef<EditorHandlingClose, ZoneNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: zones, setProjectDataValues: setZone } = useProjectZones();
  const { t } = useTranslation('database_zones');
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We use a state because synchronizing dbSymbol is easier with a state
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!descriptionRef.current) return;

    const id = findFirstAvailableId(zones, 0);
    const dbSymbol = `zone_${id}` as DbSymbol;
    const zone = createZone(dbSymbol, id);
    setText(ZONE_NAME_TEXT_ID, id, name);
    setText(ZONE_DESCRIPTION_TEXT_ID, id, descriptionRef.current.value);
    setZone({ [dbSymbol]: zone }, { zone: dbSymbol });

    closeDialog();
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
          <TooltipWrapper data-tooltip={!name ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={!name}>
              {t('create_zone')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
ZoneNewEditor.displayName = 'ZoneNewEditor';
