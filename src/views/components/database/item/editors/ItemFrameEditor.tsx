import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { IconInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@hooks/useProjectData';
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
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useItemPage } from '@hooks/usePage';
import { ItemTranslationOverlay, TranslationEditorTitle } from './ItemTranslationOverlay';
import { cloneEntity } from '@utils/cloneEntity';
import { ItemCategoryText } from './ItemCategoryText';

const itemCategoryEntries = (t: TFunction) =>
  StudioItemCategories.map((category) => ({ value: category, label: t(`${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

export const ItemFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item, currentItemName } = useItemPage();
  const { setProjectDataValues: setItems } = useProjectItems();
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const { t } = useTranslation();
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
    const itemEdited = cloneEntity(item);
    itemEdited.icon = icon;
    if (itemCategory !== ITEM_CATEGORY[item.klass]) {
      setItems({ [item.dbSymbol]: mutateItemInto(itemEdited, createItem(ITEM_CATEGORY_INITIAL_CLASSES[itemCategory], item.dbSymbol, item.id)) });
    } else {
      setItems({ [item.dbSymbol]: itemEdited });
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
    <Editor type="edit" title={t('information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={currentItemName} ref={nameRef} placeholder={t('example_item')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name-plural">{t('name_plural')}</Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_name_plural')}>
            <Input type="text" name="name-plural" defaultValue={getItemNamePlural(item)} ref={namePluralRef} placeholder={t('example_item_plural')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <TranslateInputContainer onTranslateClick={() => handleTranslateClick('translation_description')}>
            <MultiLineInput id="descr" defaultValue={getItemDescription(item)} ref={descriptionRef} placeholder={t('example_description_item')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="icon" required>
            {t('icon')}
          </Label>
          {item.icon.length === 0 ? (
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
          <SelectCustomSimple
            id="select-category"
            options={options}
            onChange={setItemCategory as (v: string) => void}
            value={itemCategory}
            noTooltip
          />
          <ItemCategoryText itemCategory={itemCategory} />
        </InputWithTopLabelContainer>
      </InputContainer>
      {/* todo look why this is wrong */}
      <ItemTranslationOverlay item={item} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
ItemFrameEditor.displayName = 'ItemFrameEditor';
