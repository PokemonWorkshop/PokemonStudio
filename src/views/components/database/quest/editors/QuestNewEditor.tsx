import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useProjectQuests } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { QUEST_CATEGORIES, QUEST_DESCRIPTION_TEXT_ID, QUEST_NAME_TEXT_ID, QUEST_RESOLUTIONS } from '@modelEntities/quest';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { createQuest } from '@utils/entityCreation';
import { TooltipWrapper } from '@ds/Tooltip';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import styled from 'styled-components';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Select } from '@ds/Select';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectQuest } from '@components/selects';
import { importQuestData } from '@utils/importEntityDataUtils';

const questCategoryEntries = (t: TFunction<'database_quests'>) => QUEST_CATEGORIES.map((category) => ({ value: category, label: t(category) }));

const questResolutionEntries = (t: TFunction<'database_quests'>) =>
  QUEST_RESOLUTIONS.map((resolution) => ({ value: resolution, label: t(resolution) }));

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
  const { t } = useTranslation('database_quests');
  const setText = useSetProjectText();
  const categoryOptions = useMemo(() => questCategoryEntries(t), [t]);
  const resolutionOptions = useMemo(() => questResolutionEntries(t), [t]);
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<string | undefined>();
  //const resolutionRef = useRef<string | undefined>();
  const [selectedQuest, setSelectedQuest] = useState('__undef__');
  const [importing, setImporting] = useState(false);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!descriptionRef.current || !categoryRef.current) return;

    let newQuest = createQuest(quests, categoryRef.current === 'primary', 'default');

    if (importing && selectedQuest !== '__undef__') {
      newQuest = importQuestData(newQuest, quests[selectedQuest]);
    }

    setText(QUEST_NAME_TEXT_ID, newQuest.id, name);
    setText(QUEST_DESCRIPTION_TEXT_ID, newQuest.id, descriptionRef.current.value);
    setQuest({ [newQuest.dbSymbol]: newQuest }, { quest: newQuest.dbSymbol });
    closeDialog();
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
          <Select id="select-category" options={categoryOptions} optionRef={categoryRef} defaultValue="primary" />
        </InputWithTopLabelContainer>
        {/* <InputWithTopLabelContainer>
          <Label htmlFor="select-resolution">{t('resolution')}</Label>
          <Select id="select-resolution" options={resolutionOptions} optionRef={resolutionRef} defaultValue="default" />
        </InputWithTopLabelContainer> */}
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_descr')} />
        </InputWithTopLabelContainer>
        <InputGroupCollapse title={t('other_data')} gap="16px" onClick={() => setImporting(!importing)}>
          <ImportInfoContainer>
            <ImportInfo>{t('quest_import_info')}</ImportInfo>
          </ImportInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-quest-to-import">{t('import_quest_from')}</Label>
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
