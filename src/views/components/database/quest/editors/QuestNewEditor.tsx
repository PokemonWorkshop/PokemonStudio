import React, { useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { useProjectQuests } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { QUEST_CATEGORIES, QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, QUEST_RESOLUTIONS, StudioQuestCategory } from '@modelEntities/quest';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { createQuest } from '@utils/entityCreation';
import { TooltipWrapper } from '@ds/Tooltip';

const questCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_CATEGORIES.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction<'database_quests'>) =>
  QUEST_RESOLUTIONS.map((resolution) => ({ value: resolution, label: t(resolution) }));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type QuestNewEditorProps = {
  onClose: () => void;
};

export const QuestNewEditor = ({ onClose }: QuestNewEditorProps) => {
  const { projectDataValues: quests, setProjectDataValues: setQuest } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  const setText = useSetProjectText();
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [category, setCategory] = useState<StudioQuestCategory>('primary');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const onClickNew = () => {
    if (!descriptionRef.current) return;

    const id = findFirstAvailableId(quests, 0);
    const dbSymbol = `quest_${id}` as DbSymbol;
    const quest = createQuest(dbSymbol, id, category === 'primary', 'default');
    setText(QUEST_NAME_TEXT_ID, id, name);
    setText(QUEST_DESCRIPTION_TEXT_ID, id, descriptionRef.current.value);
    setQuest({ [dbSymbol]: quest }, { quest: dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('quest_name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-category">{t('category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={(value) => setCategory(value as StudioQuestCategory)}
            value={category}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {/* <InputWithTopLabelContainer>
          <Label htmlFor="select-resolution">{t('resolution')}</Label>
          <SelectCustomSimple
            id="select-resolution"
            options={resolutionOptions}
            onChange={(value) => refreshUI((newQuest.resolution = value as QuestResolution))}
            value={newQuest.resolution}
            noTooltip
          />
        </InputWithTopLabelContainer> */}
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_descr')} />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={!name ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={!name}>
              {t('create_quest')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
