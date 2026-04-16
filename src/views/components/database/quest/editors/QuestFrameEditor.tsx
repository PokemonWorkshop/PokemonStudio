import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { Select } from '@ds/Select';
import { QUEST_CATEGORIES, QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, QUEST_RESOLUTIONS } from '@modelEntities/quest';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useQuestPage } from '@src/hooks/usePage';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { TFunction } from 'i18next';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestTranslationEditorTitle, QuestTranslationOverlay } from './QuestTranslationOverlay';
import { useUpdateQuest } from './useUpdateQuest';

const questCategoryEntries = (t: TFunction) => QUEST_CATEGORIES.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction) => QUEST_RESOLUTIONS.map((resolution) => ({ value: resolution, label: t(resolution) }));

export const QuestFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { quest } = useQuestPage();
  const updateQuest = useUpdateQuest(quest);
  const dialogsRef = useDialogsRef<QuestTranslationEditorTitle>();
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<string | undefined>(undefined);
  // const resolutionRef = useRef<string | undefined>();

  const saveTexts = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    setText(QUEST_NAME_TEXT_ID, quest.id, nameRef.current.value);
    setText(QUEST_DESCRIPTION_TEXT_ID, quest.id, descriptionRef.current.value);
  };

  const canClose = () => {
    const result = !!nameRef.current?.value && !!categoryRef.current;
    return result && !dialogsRef.current?.currentDialog;
  };

  const onClose = () => {
    if (!categoryRef.current || !canClose()) return;

    updateQuest({
      isPrimary: categoryRef.current === 'primary',
    });
    saveTexts();
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: QuestTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !descriptionRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="quest-name" required>
            {t('quest_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input
              type="text"
              name="quest-name"
              defaultValue={getText(QUEST_NAME_TEXT_ID, quest.id)}
              ref={nameRef}
              placeholder={t('example_quest')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-category">{t('category')}</Label>
          <Select id="select-category" options={categoryOptions} optionRef={categoryRef} defaultValue={quest.isPrimary ? 'primary' : 'secondary'} />
        </InputWithTopLabelContainer>
        {/* <InputWithTopLabelContainer>
          <Label htmlFor="select-resolution">{t('resolution')}</Label>
          <Select id="select-resolution" options={resolutionOptions} optionRef={resolutionRef} defaultValue={quest.resolution} />
        </InputWithTopLabelContainer> */}
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_description')}>
            <MultiLineInput
              id="descr"
              defaultValue={getText(QUEST_DESCRIPTION_TEXT_ID, quest.id)}
              ref={descriptionRef}
              placeholder={t('example_description_quest')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
      <QuestTranslationOverlay quest={quest} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
QuestFrameEditor.displayName = 'QuestFrameEditor';
