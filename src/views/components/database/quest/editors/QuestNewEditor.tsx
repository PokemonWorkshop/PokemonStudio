import React, { useMemo, useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import QuestModel, { QuestCategories, QuestResolution, QuestResolutions } from '@modelEntities/quest/Quest.model';
import styled from 'styled-components';
import { useProjectQuests } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';

const questCategoryEntries = (t: TFunction<'database_quests'>) => QuestCategories.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction<'database_quests'>) =>
  QuestResolutions.map((resolution) => ({ value: resolution, label: t(resolution) }));

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
  const { projectDataValues: quests, setProjectDataValues: setQuest, bindProjectDataValue: bindQuest } = useProjectQuests();
  const { t } = useTranslation('database_quests');
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const refreshUI = useRefreshUI();
  const [newQuest] = useState(bindQuest(QuestModel.createQuest(quests)));
  const [questText] = useState({ name: '', descr: '' });

  const onClickNew = () => {
    newQuest.setName(questText.name);
    newQuest.setDescr(questText.descr);
    setQuest({ [newQuest.dbSymbol]: newQuest }, { quest: newQuest.dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('quest_name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={questText.name}
            onChange={(event) => refreshUI((questText.name = event.target.value))}
            placeholder={t('example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-category">{t('category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={(value) => refreshUI((newQuest.isPrimary = value === 'primary'))}
            value={newQuest.isPrimary ? 'primary' : 'secondary'}
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
          <MultiLineInput
            id="descr"
            value={questText.descr}
            onChange={(event) => refreshUI((questText.descr = event.target.value))}
            placeholder={t('example_descr')}
          />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {questText.name.length === 0 && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={questText.name.length === 0}>
              {t('create_quest')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
