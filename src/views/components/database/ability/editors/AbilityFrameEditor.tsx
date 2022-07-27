import React from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import AbilityModel from '@modelEntities/ability/Ability.model';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

type AbilityFrameEditorProps = {
  ability: AbilityModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const AbilityFrameEditor = ({ ability, openTranslationEditor }: AbilityFrameEditorProps) => {
  const { t } = useTranslation('database_abilities');
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={ability.name()}
              onChange={(event) => refreshUI(ability.setName(event.target.value))}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput id="descr" value={ability.descr()} onChange={(event) => refreshUI(ability.setDescr(event.target.value))} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
