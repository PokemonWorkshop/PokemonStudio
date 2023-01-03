import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';

type ItemParametersDataEditorProps = {
  item: StudioItem;
};

export const ItemParametersDataEditor = ({ item }: ItemParametersDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();

  return LOCKED_ITEM_EDITOR[item.klass].includes('parameters') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('params')}>
      <InputContainer size="s">
        <InputWithLeftLabelContainer>
          <Label htmlFor="battle_usable">{t('battle_usable')}</Label>
          <Toggle name="battle_usable" checked={item.isBattleUsable} onChange={(event) => refreshUI((item.isBattleUsable = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="map_usable">{t('map_usable')}</Label>
          <Toggle name="map_usable" checked={item.isMapUsable} onChange={(event) => refreshUI((item.isMapUsable = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="limited_use">{t('limited_use')}</Label>
          <Toggle name="limited_use" checked={item.isLimited} onChange={(event) => refreshUI((item.isLimited = event.target.checked))} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="can_be_held">{t('can_be_held')}</Label>
          <Toggle name="can_be_held" checked={item.isHoldable} onChange={(event) => refreshUI((item.isHoldable = event.target.checked))} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
