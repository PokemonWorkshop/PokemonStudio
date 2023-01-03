import React from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { StudioZone, ZONE_DESCRIPTION_TEXT_ID, ZONE_NAME_TEXT_ID } from '@modelEntities/zone';

type ZoneFrameEditorProps = {
  zone: StudioZone;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const ZoneFrameEditor = ({ zone, openTranslationEditor }: ZoneFrameEditorProps) => {
  const { t } = useTranslation('database_zones');
  const setText = useSetProjectText();
  const getZoneName = useGetEntityNameText();
  const getZoneDescription = useGetEntityDescriptionText();

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
              value={getZoneName(zone)}
              onChange={(event) => setText(ZONE_NAME_TEXT_ID, zone.id, event.target.value)}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              id="descr"
              value={getZoneDescription(zone)}
              onChange={(event) => setText(ZONE_DESCRIPTION_TEXT_ID, zone.id, event.target.value)}
              placeholder={t('example_descr')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
