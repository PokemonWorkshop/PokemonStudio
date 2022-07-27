import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import ZoneModel from '@modelEntities/zone/Zone.model';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

type ZoneFrameEditorProps = {
  zone: ZoneModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const ZoneFrameEditor = ({ zone, openTranslationEditor }: ZoneFrameEditorProps) => {
  const { t } = useTranslation('database_zones');
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={zone.name()}
              onChange={(event) => refreshUI(zone.setName(event.target.value))}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              id="descr"
              value={zone.descr()}
              onChange={(event) => refreshUI(zone.setDescr(event.target.value))}
              placeholder={t('example_descr')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
