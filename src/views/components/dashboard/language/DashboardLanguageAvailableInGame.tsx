import React from 'react';
import { useDashboardLanguage } from './useDashboardLanguage';
import { DarkButton, EditButtonOnlyIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { DashboardLanguageTableContainer } from './DashboardLanguageStyle';
import theme from '@src/AppTheme';
import { DashboardLanguageDialogsRef } from './editors/DashboardLanguageEditorOverlay';
import { EditLanguage } from './editors/DashboardLanguageEditor';

type DashboardLanguageAvailableInGameProps = {
  dialogsRef: DashboardLanguageDialogsRef;
  setEditLanguage: React.Dispatch<React.SetStateAction<EditLanguage>>;
};

export const DashboardLanguageAvailableInGame = ({ dialogsRef, setEditLanguage }: DashboardLanguageAvailableInGameProps) => {
  const { languageConfig, disabledLanguage } = useDashboardLanguage();
  const { t } = useTranslation('dashboard_language');

  const handleEdit = (index: number) => {
    dialogsRef.current?.openDialog('edit');
    setEditLanguage({ from: 'player', index });
  };

  return (
    <DashboardLanguageTableContainer>
      {languageConfig.choosableLanguageCode.map((code, index) => (
        <div key={`language-available-in-game-${index}`} className="language">
          <span className="langage-name">{languageConfig.choosableLanguageTexts[index]}</span>
          <div className="buttons">
            <EditButtonOnlyIcon onClick={() => handleEdit(index)} color={theme.colors.primaryBase} />
            <DarkButton onClick={() => disabledLanguage(code)} disabled={languageConfig.choosableLanguageCode.length <= 1}>
              {t('disable')}
            </DarkButton>
          </div>
        </div>
      ))}
    </DashboardLanguageTableContainer>
  );
};
