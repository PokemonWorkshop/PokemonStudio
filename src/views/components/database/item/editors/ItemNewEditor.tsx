import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@hooks/useProjectData';
import styled from 'styled-components';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { DropInput } from '@components/inputs/DropInput';
import { basename, itemIconPath } from '@utils/path';
import {
  ITEM_CATEGORY_INITIAL_CLASSES,
  ITEM_DESCRIPTION_TEXT_ID,
  ITEM_NAME_TEXT_ID,
  ITEM_PLURAL_NAME_TEXT_ID,
  StudioItemCategories,
  StudioItemCategory,
} from '@modelEntities/item';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { createItem } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { TooltipWrapper } from '@ds/Tooltip';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectItem } from '@components/selects';
import { importItemData } from '@utils/importEntityDataUtils';
import { OptionSourceKey } from '@src/hooks/useSelectOptions';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@utils/sound';
import { ItemCategoryText } from './ItemCategoryText';

const itemCategoryEntries = (t: TFunction) =>
  StudioItemCategories.map((category) => ({ value: category, label: t(`${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

type ItemNewEditorProps = {
  from: 'items' | 'techItemsTable';
  closeDialog: () => void;
};

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

const CATEGORY_TO_OPTION = {
  ball: 'itemBall',
  event: 'itemEvent',
  fleeing: 'itemFleeing',
  generic: 'itemGeneric',
  heal: 'itemHealing',
  repel: 'itemRepel',
  stone: 'itemStone',
  tech: 'itemTech',
};

export const ItemNewEditor = forwardRef<EditorHandlingClose, ItemNewEditorProps>(({ from, closeDialog }, ref) => {
  const { setProjectDataValues: setItem } = useProjectItems();
  const { items } = useItemPage();
  const { t } = useTranslation();
  const options = useMemo(() => itemCategoryEntries(t), [t]);
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const namePluralRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const [itemCategory, setItemCategory] = useState<StudioItemCategory>('generic');
  const [icon, setIcon] = useState('');
  const [selectedItem, setSelectedItem] = useState('__undef__');
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!dbSymbolRef.current || !name || !descriptionRef.current || !namePluralRef.current) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const id = findFirstAvailableId(items, 1);
    let newItem = createItem(ITEM_CATEGORY_INITIAL_CLASSES[itemCategory], dbSymbol, id);

    if (importing && selectedItem !== '__undef__') {
      newItem = importItemData(newItem, items[selectedItem]);
    }

    newItem.icon = icon;
    setText(ITEM_NAME_TEXT_ID, newItem.id, name);
    setText(ITEM_DESCRIPTION_TEXT_ID, newItem.id, descriptionRef.current.value);
    setText(ITEM_PLURAL_NAME_TEXT_ID, newItem.id, namePluralRef.current.value);
    setItem({ [dbSymbol]: newItem }, { item: dbSymbol });
    playSound('ready');
    if (from === 'items') navigate(`/database/items`);
    else navigate(`/database/items/techItemsTable`);
    closeDialog();
  };

  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(items, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  const onIconChosen = (iconPath: string) => setIcon(basename(iconPath).split('.')[0]);

  const checkDisabled = () => {
    return !name || !icon || !dbSymbolRef.current || !!dbSymbolErrorType;
  };

  return (
    <Editor type="creation" title={t('new_item')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('example_item')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name-plural">{t('name_plural')}</Label>
          <Input type="text" name="name-plural" ref={namePluralRef} placeholder={t('example_item_plural')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description_item')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="icon" required>
            {t('icon')}
          </Label>
          {!icon ? (
            <DropInput
              destFolderToCopy="graphics/icons"
              imageWidth={32}
              imageHeight={32}
              name={t('icon_of_the_item')}
              extensions={['png']}
              onFileChoosen={onIconChosen}
            />
          ) : (
            <IconInput
              name={t('icon_of_the_item')}
              extensions={['png']}
              iconPathInProject={itemIconPath(icon)}
              destFolderToCopy="graphics/icons"
              onIconChoosen={onIconChosen}
              onIconClear={() => setIcon('')}
            />
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('category')}</Label>
          <SelectCustomSimple id="select-category" options={options} onChange={setItemCategory as (v: string) => void} value={itemCategory} />
          <ItemCategoryText itemCategory={itemCategory} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('example_db_symbol_item')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <InputGroupCollapse title={t('other_data')} gap="16px" onClick={() => setImporting(!importing)}>
          <ImportInfoContainer>
            <ImportInfo>{t('item_import_info')}</ImportInfo>
          </ImportInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-item-to-import">{t('import_data_from')}</Label>
            <SelectItem
              dbSymbol={selectedItem}
              onChange={(dbSymbol) => setSelectedItem(dbSymbol)}
              noLabel
              undefValueOption={t('none_option')}
              klassFilter={CATEGORY_TO_OPTION[itemCategory] as OptionSourceKey}
            />
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_item')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
ItemNewEditor.displayName = 'ItemNewEditor';
