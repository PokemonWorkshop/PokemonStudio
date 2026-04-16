import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectQuest } from '@components/selects';
import { Select } from '@ds/Select';
import { TooltipWrapper } from '@ds/Tooltip';
import { useProjectQuests } from '@hooks/useProjectData';
import {
  QUEST_CATEGORIES,
  QUEST_CUSTOM_OBJECTIVE_TEXT_ID,
  QUEST_DESCRIPTION_TEXT_ID,
  QUEST_NAME_TEXT_ID,
  QUEST_RESOLUTIONS,
} from '@modelEntities/quest';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { createQuest } from '@utils/entityCreation';
import { importQuestData } from '@utils/importEntityDataUtils';
import { TFunction } from 'i18next';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const questCategoryEntries = (t: TFunction) => QUEST_CATEGORIES.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction) => QUEST_RESOLUTIONS.map((resolution) => ({ value: resolution, label: t(resolution) }));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const ImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ImportInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

type QuestNewEditorProps = {
  closeDialog: () => void;
};

export const QuestNewEditor = forwardRef<EditorHandlingClose, QuestNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: quests, setProjectDataValues: setQuest } = useProjectQuests();
  const { t } = useTranslation();
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<string | undefined>(undefined);
  //const resolutionRef = useRef<string | undefined>();
  const [selectedQuest, setSelectedQuest] = useState('__undef__');
  const [importing, setImporting] = useState(false);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!descriptionRef.current || !categoryRef.current) return;

    let newQuest = createQuest(quests, categoryRef.current === 'primary', 'default');

    if (importing && selectedQuest !== '__undef__') {
      newQuest = importQuestData(newQuest, quests[selectedQuest], quests);

      // Copy custom objectives texts
      let objectiveCpt = 0;
      newQuest.objectives.forEach((objective) => {
        if (objective.objectiveMethodName === 'objective_custom') {
          setText(
            QUEST_CUSTOM_OBJECTIVE_TEXT_ID,
            objective.objectiveMethodArgs[1] as number,
            getText(QUEST_CUSTOM_OBJECTIVE_TEXT_ID, quests[selectedQuest].objectives[objectiveCpt].objectiveMethodArgs[1] as number),
          );
        }
        objectiveCpt++;
      });
    }

    setText(QUEST_NAME_TEXT_ID, newQuest.id, name);
    setText(QUEST_DESCRIPTION_TEXT_ID, newQuest.id, descriptionRef.current.value);
    setQuest({ [newQuest.dbSymbol]: newQuest }, { quest: newQuest.dbSymbol });
    closeDialog();
  };

  return (
    <Editor type="creation" title={t('new_quest')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('quest_name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_quest')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-category">{t('category')}</Label>
          <Select id="select-category" options={categoryOptions} optionRef={categoryRef} defaultValue="primary" />
        </InputWithTopLabelContainer>
        {/* <InputWithTopLabelContainer>
          <Label htmlFor="select-resolution">{t('resolution')}</Label>
          <Select id="select-resolution" options={resolutionOptions} optionRef={resolutionRef} defaultValue="default" />
        </InputWithTopLabelContainer> */}
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description_quest')} />
        </InputWithTopLabelContainer>
        <InputGroupCollapse title={t('other_data')} gap="16px" onClick={() => setImporting(!importing)}>
          <ImportInfoContainer>
            <ImportInfo>{t('quest_import_info')}</ImportInfo>
          </ImportInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-quest-to-import">{t('import_data_from')}</Label>
            <SelectQuest dbSymbol={selectedQuest} onChange={(dbSymbol) => setSelectedQuest(dbSymbol)} noLabel undefValueOption={t('none_option')} />
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={!name ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={!name}>
              {t('create_quest')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
QuestNewEditor.displayName = 'QuestNewEditor';
