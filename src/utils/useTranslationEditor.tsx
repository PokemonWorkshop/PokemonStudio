import { TranslationEditor, TranslationEditorTitle } from '@components/editor/TranslationEditor';
import React, { ReactNode, useCallback, useState } from 'react';

export type OpenTranslationEditorFunction = (editor: TranslationEditorTitle) => void;

type TranslationEditorSetup = Partial<Record<TranslationEditorTitle, { fileId: number; isMultiline?: boolean }>>;
type TranslationEditorOutput = {
  openTranslationEditor: OpenTranslationEditorFunction;
  closeTranslationEditor: () => void;
  translationEditor: ReactNode;
};

export const useTranslationEditor = (setup: TranslationEditorSetup, textId: number, entityName: string): TranslationEditorOutput => {
  const [translationEditor, setTranslationEditor] = useState<ReactNode>(undefined);

  const openTranslationEditor = useCallback(
    (editor: TranslationEditorTitle) => {
      const editorSetup = setup[editor];
      if (editorSetup === undefined) return;

      setTranslationEditor(
        <TranslationEditor
          title={editor}
          name={entityName}
          onClose={() => setTranslationEditor(undefined)}
          fileId={editorSetup.fileId}
          textId={textId}
          isMultiline={editorSetup.isMultiline}
        />
      );
    },
    [setup, textId, entityName, setTranslationEditor]
  );

  return {
    translationEditor,
    openTranslationEditor,
    closeTranslationEditor: () => setTranslationEditor(undefined),
  };
};
