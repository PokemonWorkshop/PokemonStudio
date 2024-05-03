import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { StudioLanguageConfig } from '@modelEntities/config';
import { useDashboardLanguage } from './useDashboardLanguage';
import { useDialogsRef } from '@utils/useDialogsRef';
import { DashboardLanguageEditorAndDeletionKeys, DashboardLanguageEditorOverlay } from './editors/DashboardLanguageEditorOverlay';
import type { EditLanguage } from './editors/DashboardLanguageEditor';
import { DashboardLanguageAvailableInGame } from './DashboardLanguageAvailableInGame';
import { Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { DashboardLanguageOtherLanguages } from './DashboardLanguageOtherLanguages';
import { LanguageDefaultContainer } from './DashboardLanguageStyle';

const languageDefaultEntries = (language: StudioLanguageConfig) =>
  language.choosableLanguageCode
    .map((code, index) => ({ value: code, label: language.choosableLanguageTexts[index] }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const DashboardLanguage = () => {
  const { languageConfig, onChangeDefaultLanguage } = useDashboardLanguage();
  const dialogsRef = useDialogsRef<DashboardLanguageEditorAndDeletionKeys>();
  const { t } = useTranslation('dashboard_language');
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(languageConfig), [languageConfig]);
  const [editLanguage, setEditLanguage] = useState<EditLanguage>({ from: 'player', index: 0 });

  return (
    <>
      <PageEditor editorTitle={t('language')} title={t('available_in_game')}>
        <DashboardLanguageAvailableInGame setEditLanguage={setEditLanguage} dialogsRef={dialogsRef} />
        <LanguageDefaultContainer>
          <Label htmlFor="select-default-language">{t('default_language')}</Label>
          <SelectCustomSimple
            id="select-default-language"
            options={languageDefaultOptions}
            onChange={(value) => onChangeDefaultLanguage(value)}
            value={languageConfig.defaultLanguage}
            noTooltip
          />
        </LanguageDefaultContainer>
      </PageEditor>
      <PageEditor
        editorTitle={t('language')}
        title={t('other_languages')}
        add={{ label: t('add_a_language'), onClick: () => dialogsRef.current?.openDialog('new') }}
      >
        <DashboardLanguageOtherLanguages setEditLanguage={setEditLanguage} dialogsRef={dialogsRef} />
      </PageEditor>
      <DashboardLanguageEditorOverlay ref={dialogsRef} editLanguage={editLanguage} />
    </>
  );
};
