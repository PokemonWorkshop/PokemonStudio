import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@utils/useProjectData';
import { DropInput } from '@components/inputs/DropInput';
import { basename, itemIconPath } from '@utils/path';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityDescriptionText, useGetItemPluralNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import {
  ITEM_CATEGORY,
  ITEM_CATEGORY_INITIAL_CLASSES,
  ITEM_DESCRIPTION_TEXT_ID,
  ITEM_NAME_TEXT_ID,
  ITEM_PLURAL_NAME_TEXT_ID,
  mutateItemInto,
  StudioItemCategories,
} from '@modelEntities/item';
import { createItem } from '@utils/entityCreation';
import { useDialogsRef } from '@utils/useDialogsRef';
import { useItemPage } from '@utils/usePage';
import { ItemTranslationOverlay, TranslationEditorTitle } from './ItemTranslationOverlay';

const itemCategoryEntries = (t: TFunction<('database_items' | 'database_types')[]>) =>
  StudioItemCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

export const ItemFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item, currentItemName } = useItemPage();
  const { setProjectDataValues: setItems } = useProjectItems();
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { t } = useTranslation(['database_items', 'database_types']);
  const options = useMemo(() => itemCategoryEntries(t), [t]);
  const getItemDescription = useGetEntityDescriptionText();
  const getItemNamePlural = useGetItemPluralNameText();
  const setText = useSetProjectText();
  const nameRef = useRef<HTMLInputElement>(null);
  const namePluralRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [icon, setIcon] = useState(item.icon);
  const [itemCategory, setItemCategory] = useState(ITEM_CATEGORY[item.klass]);

  const canClose = () => !!nameRef.current?.value && !!descriptionRef.current && !!icon;
  const onClose = () => {
    if (!nameRef.current || !namePluralRef.current || !descriptionRef.current || !canClose()) return;
    setText(ITEM_NAME_TEXT_ID, item.id, nameRef.current.value);
    setText(ITEM_PLURAL_NAME_TEXT_ID, item.id, namePluralRef.current.value);
    setText(ITEM_DESCRIPTION_TEXT_ID, item.id, descriptionRef.current.value);
    item.icon = icon;
    if (itemCategory != ITEM_CATEGORY[item.klass]) {
      setItems({ [item.dbSymbol]: mutateItemInto(item, createItem(ITEM_CATEGORY_INITIAL_CLASSES[itemCategory], item.dbSymbol, item.id)) });
    } else {
      setItems({ [item.dbSymbol]: item });
    }
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editor: TranslationEditorTitle) => {
    if (!nameRef.current || !descriptionRef.current) return;
    onClose(); // Effectively set the translation values

    setTimeout(() => dialogsRef.current?.openDialog(editor), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current || !namePluralRef.current || !descriptionRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
    namePluralRef.current.value = namePluralRef.current.defaultValue;
    descriptionRef.current.value = descriptionRef.current.defaultValue;
  };

  const onIconChosen = (iconPath: string) => setIcon(basename(iconPath).split('.')[0]);

  return (
    <Editor type="edit" title={t('database_items:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_items:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={currentItemName} ref={nameRef} placeholder={t('database_items:example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name-plural">{t('database_items:name_plural')}</Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_name_plural')}>
            <Input
              type="text"
              name="name-plural"
              defaultValue={getItemNamePlural(item)}
              ref={namePluralRef}
              placeholder={t('database_items:example_name_plural')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_items:description')}</Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_description')}>
            <MultiLineInput
              id="descr"
              defaultValue={getItemDescription(item)}
              ref={descriptionRef}
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
          <SelectCustomSimple
            id="select-category"
            options={options}
            onChange={setItemCategory as (v: string) => void}
            value={itemCategory}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
      {/* todo look why this is wrong */}
      <ItemTranslationOverlay item={item} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
ItemFrameEditor.displayName = 'ItemFrameEditor';
