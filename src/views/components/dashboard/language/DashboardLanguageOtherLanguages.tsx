import React, { useMemo } from 'react';
import { useDashboardLanguage } from './useDashboardLanguage';
import { useTranslation } from 'react-i18next';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon, SecondaryButton } from '@components/buttons';
import { DashboardLanguageTableContainer } from './DashboardLanguageStyle';
import { DashboardLanguageDialogsRef } from './editors/DashboardLanguageEditorOverlay';
import { EditLanguage } from './editors/DashboardLanguageEditor';
import { cloneEntity } from '@utils/cloneEntity';
import theme from '@src/AppTheme';
import { DEFAULT_OTHER_LANGUAGES } from '@modelEntities/config';
import { getLanguageName } from '@utils/getLanguageDisplayText';
import i18n from '@src/i18n';
import { TooltipWrapper } from '@ds/Tooltip';

type DashboardLanguageOtherLanguagesProps = {
  dialogsRef: DashboardLanguageDialogsRef;
  setEditLanguage: React.Dispatch<React.SetStateAction<EditLanguage>>;
};

export const DashboardLanguageOtherLanguages = ({ dialogsRef, setEditLanguage }: DashboardLanguageOtherLanguagesProps) => {
  const { projectStudio, languageConfig, updateProjectStudio, enableLanguageInGame } = useDashboardLanguage();
  const otherLanguages = useMemo(
    () => projectStudio.languagesTranslation.filter(({ code }) => !languageConfig.choosableLanguageCode.includes(code)),
    [projectStudio, languageConfig]
  );
  const { t } = useTranslation(['dashboard_language', 'text_management']);

  const findIndexByCode = (code: string) => projectStudio.languagesTranslation.findIndex(({ code: c }) => c === code);

  const handleEdit = (index: number) => {
    dialogsRef.current?.openDialog('edit');
    setEditLanguage({ from: 'translation', index });
  };

  const handleDelete = (code: string) => {
    const languagesTranslation = cloneEntity(projectStudio.languagesTranslation);
    const index = findIndexByCode(code);
    if (index === -1) return;

    languagesTranslation.splice(index, 1);
    updateProjectStudio({ languagesTranslation });
  };

  return (
    <DashboardLanguageTableContainer>
      {otherLanguages.length === 0 ? (
        <span className="empty-list">{t('dashboard_language:no_other_language')}</span>
      ) : (
        otherLanguages.map(({ code, name }, index) => {
          const disableDelete = DEFAULT_OTHER_LANGUAGES.find(({ code: c }) => c === code);
          return (
            <div key={`other-language-${index}`} className="language">
              <span data-tooltip={name} className="langage-name">
                {getLanguageName(code, name, t, i18n)}
                <span className="language-code"> - {code}</span>
              </span>
              <div className="buttons">
                <div className="actions">
                  <EditButtonOnlyIcon onClick={() => handleEdit(index)} color={theme.colors.primaryBase} />
                  <TooltipWrapper data-tooltip={disableDelete ? t('dashboard_language:disable_delete') : undefined}>
                    <DeleteButtonOnlyIcon onClick={() => handleDelete(code)} disabled={disableDelete} />
                  </TooltipWrapper>
                </div>
                <SecondaryButton onClick={() => enableLanguageInGame(code)}>{t('dashboard_language:enable_in_game')}</SecondaryButton>
              </div>
            </div>
          );
        })
      )}
    </DashboardLanguageTableContainer>
  );
};
