import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { QUEST_CATEGORIES, QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, QUEST_RESOLUTIONS, StudioQuest } from '@modelEntities/quest';

const questCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_CATEGORIES.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction<'database_quests'>) =>
  QUEST_RESOLUTIONS.map((resolution) => ({ value: resolution, label: t(resolution) }));

type QuestFrameEditorProps = {
  quest: StudioQuest;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const QuestFrameEditor = ({ quest, openTranslationEditor }: QuestFrameEditorProps) => {
  const { t } = useTranslation('database_quests');
  const getQuestName = useGetEntityNameText();
  const getQuestDescription = useGetEntityDescriptionText();
  const setText = useSetProjectText();
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('quest_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={getQuestName(quest)}
              onChange={(event) => setText(QUEST_NAME_TEXT_ID, quest.id, event.target.value)}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-category">{t('category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={(value) => refreshUI((quest.isPrimary = value === 'primary'))}
            value={quest.isPrimary ? 'primary' : 'secondary'}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {/* <InputWithTopLabelContainer>
          <Label htmlFor="select-resolution">{t('resolution')}</Label>
          <SelectCustomSimple
            id="select-resolution"
            options={resolutionOptions}
            onChange={(value) => refreshUI((quest.resolution = value as QuestResolution))}
            value={quest.resolution}
            noTooltip
          />
        </InputWithTopLabelContainer> */}
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              id="descr"
              value={getQuestDescription(quest)}
              onChange={(event) => setText(QUEST_DESCRIPTION_TEXT_ID, quest.id, event.target.value)}
              placeholder={t('example_descr')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
