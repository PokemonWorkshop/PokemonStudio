import React, { forwardRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useProjectSavingLanguage } from '@hooks/useProjectSavingLanguage';
import { cloneEntity } from '@utils/cloneEntity';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DashboardLanguageType, useDashboardLanguage } from '../useDashboardLanguage';
import { TooltipWrapper } from '@ds/Tooltip';

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

export type NewLanguage = {
  from: DashboardLanguageType;
  name: string;
};

type LanguageDefaultValue = {
  text: string;
  code: string;
};

type DashboardLanguageNewEditorProps = {
  closeDialog: () => void;
};

export const DashboardLanguageNewEditor = forwardRef<EditorHandlingClose, DashboardLanguageNewEditorProps>(({ closeDialog }, ref) => {
  const { projectStudio, updateProjectStudio } = useDashboardLanguage();
  const { addNewLanguageProjectText } = useProjectSavingLanguage();
  const { t } = useTranslation('dashboard_language');
  const [languageText, setLanguageText] = useState<LanguageDefaultValue>({ text: '', code: '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const codes = useMemo(() => projectStudio.languagesTranslation.map(({ code }) => code), []);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (checkDisabled()) return;

    const languagesTranslation = cloneEntity(projectStudio.languagesTranslation);
    languagesTranslation.push({ code: languageText.code, name: languageText.text });
    addNewLanguageProjectText(languageText.code);
    updateProjectStudio({ languagesTranslation });
    closeDialog();
  };

  const onChangePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = event.target.value.toLocaleLowerCase();
    if (prefix.length > 5) return event.preventDefault();

    setLanguageText({ ...languageText, code: prefix });
  };

  const isCodeUnique = () => !codes.includes(languageText.code);
  const checkDisabled = () => languageText.text === '' || languageText.code === '' || !isCodeUnique();

  return (
    <Editor type="creation" title={t('other_languages')}>
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
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('add_language')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
DashboardLanguageNewEditor.displayName = 'DashboardLanguageNewEditor';
