import React, { useMemo, useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import ItemModel, { ItemCategories } from '@modelEntities/item/Item.model';
import { TFunction, useTranslation } from 'react-i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@utils/useProjectData';
import { mutateItemToCategory } from './mutateItemToCategory';
import styled from 'styled-components';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, wrongDbSymbol } from '@utils/dbSymbolCheck';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { DropInput } from '@components/inputs/DropInput';
import path from 'path';
import { useGlobalState } from '@src/GlobalStateProvider';

const itemCategoryEntries = (t: TFunction<('database_items' | 'database_types' | 'database_moves')[]>) =>
  ItemCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

type ItemNewEditorProps = {
  onClose: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

export const ItemNewEditor = ({ onClose }: ItemNewEditorProps) => {
  const { projectDataValues: items, setProjectDataValues: setItem, bindProjectDataValue: bindItem } = useProjectItems();
  const { t } = useTranslation(['database_items', 'database_types', 'database_moves']);
  const options = useMemo(() => itemCategoryEntries(t), [t]);
  const refreshUI = useRefreshUI();
  const [newItem, setNewItem] = useState(bindItem(ItemModel.createItem(items)));
  const [itemText] = useState({ name: '', descr: '' });
  const [state] = useGlobalState();

  const onClickNew = () => {
    newItem.setName(itemText.name);
    newItem.setDescr(itemText.descr);
    setItem({ [newItem.dbSymbol]: newItem }, { item: newItem.dbSymbol });
    onClose();
  };

  const checkDisabled = () => {
    return (
      itemText.name.length === 0 ||
      newItem.icon.length === 0 ||
      newItem.dbSymbol.length === 0 ||
      wrongDbSymbol(newItem.dbSymbol) ||
      checkDbSymbolExist(items, newItem.dbSymbol)
    );
  };

  const onIconChoosen = (iconPath: string) => {
    refreshUI((newItem.icon = path.basename(iconPath).split('.')[0]));
  };

  const onIconClear = () => {
    refreshUI((newItem.icon = ''));
  };

  return (
    <Editor type="creation" title={t('database_items:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_items:name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={itemText.name}
            onChange={(event) => refreshUI((itemText.name = event.target.value))}
            placeholder={t('database_items:example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_items:description')}</Label>
          <MultiLineInput
            id="descr"
            value={itemText.descr}
            onChange={(event) => refreshUI((itemText.descr = event.target.value))}
            placeholder={t('database_items:example_description')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="icon" required>
            {t('database_items:icon')}
          </Label>
          {newItem.icon.length === 0 ? (
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
              iconPath={newItem.iconUrl(state.projectPath || 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png')}
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
              setNewItem(mutateItemToCategory(newItem, value as typeof options[number]['value']));
            }}
            value={newItem.category}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            value={newItem.dbSymbol}
            onChange={(event) => refreshUI((newItem.dbSymbol = event.target.value))}
            error={wrongDbSymbol(newItem.dbSymbol) || checkDbSymbolExist(items, newItem.dbSymbol)}
            placeholder={t('database_items:example_db_symbol')}
          />
          {newItem.dbSymbol.length !== 0 && wrongDbSymbol(newItem.dbSymbol) && (
            <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
          )}
          {newItem.dbSymbol.length !== 0 && checkDbSymbolExist(items, newItem.dbSymbol) && (
            <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>
          )}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_items:create_item')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
