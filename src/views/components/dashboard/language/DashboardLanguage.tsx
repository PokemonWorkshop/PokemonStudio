import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { PageEditor } from '@components/pages';
import { StudioLanguageConfig } from '@modelEntities/config';
import { useDashboardLanguage } from './useDashboardLanguage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { DashboardLanguageEditorAndDeletionKeys, DashboardLanguageEditorOverlay } from './editors/DashboardLanguageEditorOverlay';
import type { EditLanguage } from './editors/DashboardLanguageEditor';
import { DashboardLanguageAvailableInGame } from './DashboardLanguageAvailableInGame';
import { Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { DashboardLanguageOtherLanguages } from './DashboardLanguageOtherLanguages';
import { LanguageDefaultContainer } from './DashboardLanguageStyle';
import { getLanguageName } from '@utils/getLanguageDisplayText';
import i18n from '@src/i18n';

const languageDefaultEntries = (language: StudioLanguageConfig, t: TFunction<'text_management'>) =>
  language.choosableLanguageCode
    .map((code, index) => ({ value: code, label: getLanguageName(code, language.choosableLanguageTexts[index], t, i18n) }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const DashboardLanguage = () => {
  const { languageConfig, onChangeDefaultLanguage } = useDashboardLanguage();
  const dialogsRef = useDialogsRef<DashboardLanguageEditorAndDeletionKeys>();
  const { t } = useTranslation('dashboard_language');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const languageDefaultOptions = useMemo(() => languageDefaultEntries(languageConfig, t), [languageConfig, languageConfig.choosableLanguageTexts]);
  const [editLanguage, setEditLanguage] = useState<EditLanguage>({ from: 'player', index: 0 });

  return (
    <>
      <PageEditor editorTitle={t('language')} title={t('available_in_game')} canCollapse>
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
        canCollapse
      >
        <DashboardLanguageOtherLanguages setEditLanguage={setEditLanguage} dialogsRef={dialogsRef} />
      </PageEditor>
      <DashboardLanguageEditorOverlay ref={dialogsRef} editLanguage={editLanguage} />
    </>
  );
};
