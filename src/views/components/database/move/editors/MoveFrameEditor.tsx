import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import MoveModel, { MoveCategories } from '@modelEntities/move/Move.model';
import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectType } from '@components/selects';
import { SelectCustomSimple } from '@components/SelectCustom';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

const moveCategoryEntries = (t: TFunction<('database_moves' | 'database_types')[]>) =>
  MoveCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

type MoveFrameEditorProps = {
  move: MoveModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const MoveFrameEditor = ({ move, openTranslationEditor }: MoveFrameEditorProps) => {
  const { t } = useTranslation(['database_moves', 'database_types']);
  const categoryOptions = useMemo(() => moveCategoryEntries(t), [t]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('database_moves:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={move.name()}
              onChange={(event) => refreshUI(move.setName(event.target.value))}
              placeholder={t('database_moves:example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_moves:description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              id="descr"
              value={move.descr()}
              onChange={(event) => refreshUI(move.setDescr(event.target.value))}
              placeholder={t('database_moves:example_description')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:type')}</Label>
          <SelectType dbSymbol={move.type} onChange={(event) => refreshUI((move.type = event.value))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:category')}</Label>
          <SelectCustomSimple
            id="select-type"
            options={categoryOptions}
            onChange={(value) => refreshUI((move.category = value))}
            value={move.category}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
