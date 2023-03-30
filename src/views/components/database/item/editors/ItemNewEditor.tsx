import React, { useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@utils/useProjectData';
import styled from 'styled-components';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
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

const itemCategoryEntries = (t: TFunction<('database_items' | 'database_types' | 'database_moves')[]>) =>
  StudioItemCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

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
  const { projectDataValues: items, setProjectDataValues: setItem } = useProjectItems();
  const { t } = useTranslation(['database_items', 'database_types', 'database_moves']);
  const options = useMemo(() => itemCategoryEntries(t), [t]);
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const namePluralRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const [itemCategory, setItemCategory] = useState<StudioItemCategory>('generic');
  const [icon, setIcon] = useState('');

  const onClickNew = () => {
    if (!dbSymbolRef.current || !name || !descriptionRef.current || !namePluralRef.current) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const id = findFirstAvailableId(items, 1);
    const newItem = createItem(ITEM_CATEGORY_INITIAL_CLASSES[itemCategory], dbSymbol, id);
    newItem.icon = icon;
    setText(ITEM_NAME_TEXT_ID, newItem.id, name);
    setText(ITEM_DESCRIPTION_TEXT_ID, newItem.id, descriptionRef.current.value);
    setText(ITEM_PLURAL_NAME_TEXT_ID, newItem.id, namePluralRef.current.value);
    setItem({ [dbSymbol]: newItem }, { item: dbSymbol });
    onClose();
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
    <Editor type="creation" title={t('database_items:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_items:name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('database_items:example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name-plural">{t('database_items:name_plural')}</Label>
          <Input type="text" name="name-plural" ref={namePluralRef} placeholder={t('database_items:example_name_plural')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_items:description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('database_items:example_description')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="icon" required>
            {t('database_items:icon')}
          </Label>
          {!icon ? (
            <DropInput
              destFolderToCopy="graphics/icons"
              imageWidth={32}
              imageHeight={32}
              name={t('database_items:icon_of_the_item')}
              extensions={['png']}
              onFileChoosen={onIconChosen}
            />
          ) : (
            <IconInput
              name={t('database_items:icon_of_the_item')}
              extensions={['png']}
              iconPathInProject={itemIconPath(icon)}
              destFolderToCopy="graphics/icons"
              onIconChoosen={onIconChosen}
              onIconClear={() => setIcon('')}
            />
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('database_items:category')}</Label>
          <SelectCustomSimple id="select-category" options={options} onChange={setItemCategory as (v: string) => void} value={itemCategory} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('database_items:example_db_symbol')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>}
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
