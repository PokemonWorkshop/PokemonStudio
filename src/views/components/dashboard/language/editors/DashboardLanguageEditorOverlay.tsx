import React from 'react';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@utils/useDialogsRef';
import { DashboardLanguageEditor, DashboardLanguageNewEditor } from '.';
import type { EditLanguage } from './DashboardLanguageEditor';

export type DashboardLanguageEditorAndDeletionKeys = 'new' | 'edit';
export type DashboardLanguageDialogsRef = React.RefObject<DialogRefData<DashboardLanguageEditorAndDeletionKeys>>;

type Props = {
  editLanguage: EditLanguage;
};

/**
 * Editor overlay for the dashboard language.
 * This component uses the generic editor overlay to show the components based on what's called from dialogsRef.
 */
export const DashboardLanguageEditorOverlay = defineEditorOverlay<DashboardLanguageEditorAndDeletionKeys, Props>(
  'DashboardLanguageEditorOverlay',
  (dialogToShow, handleCloseRef, closeDialog, { editLanguage }) => {
    switch (dialogToShow) {
      case 'new':
        return <DashboardLanguageNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
      case 'edit':
        return <DashboardLanguageEditor ref={handleCloseRef} editLanguage={editLanguage} />;
      default:
        return assertUnreachable(dialogToShow);
    }
  }
);
