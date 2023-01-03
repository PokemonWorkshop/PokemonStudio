import { TranslationEditor, TranslationEditorTitle } from '@components/editor/TranslationEditor';
import React, { ReactNode, useCallback, useState } from 'react';

type OpenEditorOptions = {
  currentEntityName?: string;
  onEditorClose?: () => void;
};
export type OpenTranslationEditorFunction = (editor: TranslationEditorTitle, options?: OpenEditorOptions) => void;

type TranslationEditorSetup = Partial<Record<TranslationEditorTitle, { fileId: number; isMultiline?: boolean }>>;
type TranslationEditorOutput = {
  openTranslationEditor: OpenTranslationEditorFunction;
  closeTranslationEditor: () => void;
  translationEditor: ReactNode;
};

export const useTranslationEditor = (setup: TranslationEditorSetup, textId: number, entityName: string): TranslationEditorOutput => {
  const [translationEditor, setTranslationEditor] = useState<ReactNode>(undefined);

  const openTranslationEditor = useCallback(
    (editor: TranslationEditorTitle, options?: OpenEditorOptions) => {
      const editorSetup = setup[editor];
      if (editorSetup === undefined) return;

      const onClose = () => {
        options?.onEditorClose?.();
        setTranslationEditor(undefined);
      };
      setTranslationEditor(
        <TranslationEditor
          title={editor}
          name={options?.currentEntityName || entityName}
          onClose={onClose}
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
