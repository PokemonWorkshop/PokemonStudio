import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardTemplate } from '@components/dashboard';
import { DashboardFonts } from '@components/dashboard/texts';
import { DashboardFontsEditor, DashboardFontsNewEditor } from '@components/dashboard/texts/editors';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { useConfigTexts } from '@utils/useProjectConfig';
import { cloneEntity } from '@utils/cloneEntity';
import { cleaningTextNaNValues } from '@utils/cleanNaNValue';

export const DashboardTextsPage = () => {
  const { projectConfigValues: texts, setProjectConfigValues: setTexts } = useConfigTexts();
  const { t } = useTranslation('dashboard_texts');
  const currentEditedTexts = useMemo(() => cloneEntity(texts), [texts]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const editFontsIndex = useRef<number>(0);

  const onCloseEditor = () => {
    if (currentEditor === 'editFont' && !currentEditedTexts.fonts.ttfFiles[editFontsIndex.current].name) return;

    cleaningTextNaNValues(currentEditedTexts);
    setTexts(currentEditedTexts);
    setCurrentEditor(undefined);
  };

  const onClickDelete = (fontsOrAltSizes: 'fonts' | 'altSizes') => {
    if (fontsOrAltSizes === 'fonts') {
      currentEditedTexts.fonts.ttfFiles = [];
    } else if (fontsOrAltSizes === 'altSizes') {
      currentEditedTexts.fonts.altSizes = [];
    }
    setTexts(currentEditedTexts);
    setCurrentDeletion(undefined);
  };

  const editors = {
    newFont: <DashboardFontsNewEditor isAlternative={false} onClose={() => setCurrentEditor(undefined)} />,
    newAltSize: <DashboardFontsNewEditor isAlternative={true} onClose={() => setCurrentEditor(undefined)} />,
    editFont: <DashboardFontsEditor texts={currentEditedTexts} index={editFontsIndex.current} isAlternative={false} />,
    editAltSize: <DashboardFontsEditor texts={currentEditedTexts} index={editFontsIndex.current} isAlternative={true} />,
  };

  const deletions = {
    deleteAllFonts: (
      <Deletion
        title={t('deletion_of_fonts')}
        message={t('deletion_message_fonts')}
        onClickDelete={() => onClickDelete('fonts')}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
    deleteAllAltSizes: (
      <Deletion
        title={t('deletion_of_alt_sizes')}
        message={t('deletion_message_alt_sizes')}
        onClickDelete={() => onClickDelete('altSizes')}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  return (
    <DashboardTemplate title={t('texts')}>
      <DashboardFonts
        isAlternative={false}
        onNew={() => setCurrentEditor('newFont')}
        onEdit={(index: number) => {
          setCurrentEditor('editFont');
          editFontsIndex.current = index;
        }}
        onDeleteAll={() => setCurrentDeletion('deleteAllFonts')}
      />
      <DashboardFonts
        isAlternative={true}
        onNew={() => setCurrentEditor('newAltSize')}
        onEdit={(index: number) => {
          setCurrentEditor('editAltSize');
          editFontsIndex.current = index;
        }}
        onDeleteAll={() => setCurrentDeletion('deleteAllAltSizes')}
      />
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
      <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
    </DashboardTemplate>
  );
};
