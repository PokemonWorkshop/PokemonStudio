import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import ItemModel, { ItemCategories } from '@modelEntities/item/Item.model';
import { TFunction, useTranslation } from 'react-i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { UseProjectItemReturnType } from '@utils/useProjectData';
import { mutateItemToCategory } from './mutateItemToCategory';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { useGlobalState } from '@src/GlobalStateProvider';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

const itemCategoryEntries = (t: TFunction<('database_items' | 'database_types')[]>) =>
  ItemCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

type ItemFrameEditorProps = {
  item: ItemModel;
  setItems: UseProjectItemReturnType['setProjectDataValues'];
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const ItemFrameEditor = ({ item, setItems, openTranslationEditor }: ItemFrameEditorProps) => {
  const { t } = useTranslation(['database_items', 'database_types']);
  const options = useMemo(() => itemCategoryEntries(t), [t]);
  const refreshUI = useRefreshUI();
  const [state] = useGlobalState();

  const onIconChoosen = (iconPath: string) => {
    refreshUI((item.icon = basename(iconPath).split('.')[0]));
  };

  const onIconClear = () => {
    refreshUI((item.icon = ''));
  };

  return (
    <Editor type="edit" title={t('database_items:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_items:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={item.name()}
              onChange={(event) => refreshUI(item.setName(event.target.value))}
              placeholder={t('database_items:example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_items:description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              id="descr"
              value={item.descr()}
              onChange={(event) => refreshUI(item.setDescr(event.target.value))}
              placeholder={t('database_items:example_description')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="icon" required>
            {t('database_items:icon')}
          </Label>
          {item.icon.length === 0 ? (
            <DropInput
              imageWidth={32}
              imageHeight={32}
              name={t('database_items:icon_of_the_item')}
              extensions={['png']}
              onFileChoosen={onIconChoosen}
            />
          ) : (
            <IconInput
              name={t('database_items:icon_of_the_item')}
              extensions={['png']}
              iconPath={item.iconUrl(state.projectPath || 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png')}
              onIconChoosen={onIconChoosen}
              onIconClear={onIconClear}
            />
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('database_items:category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={options}
            onChange={(value) => {
              setItems({ [item.dbSymbol]: mutateItemToCategory(item, value as typeof options[number]['value']) });
            }}
            value={item.category}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
