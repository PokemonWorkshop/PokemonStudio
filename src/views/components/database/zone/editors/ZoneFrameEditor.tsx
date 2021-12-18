import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import ZoneModel from '@modelEntities/zone/Zone.model';

type ZoneFrameEditorProps = {
  zone: ZoneModel;
};

export const ZoneFrameEditor = ({ zone }: ZoneFrameEditorProps) => {
  const { t } = useTranslation('database_zones');
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={zone.name()}
            onChange={(event) => refreshUI(zone.setName(event.target.value))}
            placeholder={t('example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput
            id="descr"
            value={zone.descr()}
            onChange={(event) => refreshUI(zone.setDescr(event.target.value))}
            placeholder={t('example_descr')}
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
