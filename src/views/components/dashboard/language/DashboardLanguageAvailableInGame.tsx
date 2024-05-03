import React from 'react';
import { useDashboardLanguage } from './useDashboardLanguage';
import { DarkButton, EditButtonOnlyIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { DashboardLanguageTableContainer } from './DashboardLanguageStyle';
import theme from '@src/AppTheme';
import { DashboardLanguageDialogsRef } from './editors/DashboardLanguageEditorOverlay';
import { EditLanguage } from './editors/DashboardLanguageEditor';
import { getLanguageName } from '@utils/getLanguageDisplayText';
import i18n from '@src/i18n';

type DashboardLanguageAvailableInGameProps = {
  dialogsRef: DashboardLanguageDialogsRef;
  setEditLanguage: React.Dispatch<React.SetStateAction<EditLanguage>>;
};

export const DashboardLanguageAvailableInGame = ({ dialogsRef, setEditLanguage }: DashboardLanguageAvailableInGameProps) => {
  const { languageConfig, disabledLanguage } = useDashboardLanguage();
  const { t } = useTranslation(['dashboard_language', 'text_management']);

  const handleEdit = (index: number) => {
    dialogsRef.current?.openDialog('edit');
    setEditLanguage({ from: 'player', index });
  };

  return (
    <DashboardLanguageTableContainer>
      {languageConfig.choosableLanguageCode.map((code, index) => (
        <div key={`language-available-in-game-${index}`} className="language">
          <span data-tooltip={getLanguageName(code, languageConfig.choosableLanguageTexts[index], t, i18n)} className="langage-name">
            {languageConfig.choosableLanguageTexts[index]}
          </span>
          <div className="buttons">
            <EditButtonOnlyIcon onClick={() => handleEdit(index)} color={theme.colors.primaryBase} />
            <DarkButton onClick={() => disabledLanguage(code)} disabled={languageConfig.choosableLanguageCode.length <= 1}>
              {t('dashboard_language:disable')}
            </DarkButton>
          </div>
        </div>
      ))}
    </DashboardLanguageTableContainer>
  );
};
