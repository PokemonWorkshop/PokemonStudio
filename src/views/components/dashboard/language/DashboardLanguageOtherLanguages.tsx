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
  const { t } = useTranslation('dashboard_language');

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
        <span className="empty-list">{t('no_other_language')}</span>
      ) : (
        otherLanguages.map(({ code, name }, index) => (
          <div key={`other-language-${index}`} className="language">
            <span className="langage-name">{name}</span>
            <div className="buttons">
              <div className="actions">
                <EditButtonOnlyIcon onClick={() => handleEdit(index)} color={theme.colors.primaryBase} />
                <DeleteButtonOnlyIcon onClick={() => handleDelete(code)} disabled={DEFAULT_OTHER_LANGUAGES.find(({ code: c }) => c === code)} />
              </div>
              <SecondaryButton onClick={() => enableLanguageInGame(code)}>{t('enable_in_game')}</SecondaryButton>
            </div>
          </div>
        ))
      )}
    </DashboardLanguageTableContainer>
  );
};
