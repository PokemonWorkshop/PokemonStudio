import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useProjectSavingLanguage } from '@utils/useProjectSavingLanguage';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useDashboardLanguage } from '../useDashboardLanguage';
import { useUpdateLanguage } from './useUpdateLanguage';
import { useUpdateGameOptions } from '@components/dashboard/gameOptions';
import { useUpdateProjectStudio } from '@utils/useUpdateProjectStudio';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 0 0;
  gap: 8px;
`;

const CodeInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const CodeErrorContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.dangerBase};
`;

const getCode = (languageText: string) => languageText.slice(0, languageText.length === 1 ? 1 : 2).toLocaleLowerCase();

export type NewLanguage = {
  from: 'translation' | 'player';
  name: string;
};

type LanguageDefaultValue = {
  text: string;
  code: string;
};

type DashboardLanguageNewEditorProps = {
  newLanguage: NewLanguage;
  closeDialog: () => void;
};

export const DashboardLanguageNewEditor = forwardRef<EditorHandlingClose, DashboardLanguageNewEditorProps>(({ newLanguage, closeDialog }, ref) => {
  const { languageConfig, gameOptions, projectStudio } = useDashboardLanguage();
  const updateLanguageConfig = useUpdateLanguage(languageConfig);
  const updateGameOptions = useUpdateGameOptions(gameOptions);
  const updateProjectStudio = useUpdateProjectStudio(projectStudio);
  const { addNewLanguageProjectText } = useProjectSavingLanguage();
  const { t } = useTranslation('dashboard_language');
  const [languageText, setLanguageText] = useState<LanguageDefaultValue>({ text: newLanguage.name, code: getCode(newLanguage.name) });

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (checkDisabled()) return;

    const languagesTranslation = cloneEntity(projectStudio.languagesTranslation);
    languagesTranslation.push({ code: languageText.code, name: languageText.text });
    if (newLanguage.from === 'player') {
      const currentEditedLanguage = cloneEntity(languageConfig);
      currentEditedLanguage.choosableLanguageTexts.push(languageText.text);
      currentEditedLanguage.choosableLanguageCode.push(languageText.code);
      if (currentEditedLanguage.choosableLanguageCode.length > 1 && !gameOptions.order.includes('language')) {
        const order = cloneEntity(gameOptions.order);
        order.push('language');
        updateGameOptions({ order });
      }
      updateLanguageConfig(currentEditedLanguage);
    }
    addNewLanguageProjectText(languageText.code);
    updateProjectStudio({ languagesTranslation });
    closeDialog();
  };

  const onChangePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = event.target.value.toLocaleLowerCase();
    if (prefix.length >= 5) return event.preventDefault();

    setLanguageText({ ...languageText, code: prefix });
  };

  // TODO: save old projectStudio.languagesTranslation pour empêcher de voir une fausse erreur
  const isCodeUnique = () => projectStudio.languagesTranslation.find(({ code }) => code === languageText.code) === undefined;
  const checkDisabled = () => languageText.text === '' || languageText.code === '' || !isCodeUnique();

  return (
    <Editor type="creation" title={newLanguage.from === 'player' ? t('available_languages_players') : t('available_languages_translation')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="language-text" required>
            {t('language')}
          </Label>
          <Input
            type="text"
            name="language-text"
            value={languageText.text}
            onChange={(event) => setLanguageText({ ...languageText, text: event.target.value })}
            placeholder={t('placeholder_language')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="language-prefix" required>
            {t('prefix')}
          </Label>
          <Input
            type="text"
            name="language-prefix"
            value={languageText.code}
            onChange={(event) => onChangePrefix(event)}
            error={!isCodeUnique()}
            placeholder={t('placeholder_prefix')}
          />
          {!isCodeUnique() && <CodeErrorContainer>{t('code_error')}</CodeErrorContainer>}
          <CodeInfoContainer>{t('code_info')}</CodeInfoContainer>
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('add_language')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
DashboardLanguageNewEditor.displayName = 'DashboardLanguageNewEditor';
