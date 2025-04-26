import { DataFieldsetFieldWithChild, FieldData } from '@components/database/dataBlocks/DataFieldsetField';
import { StudioItemHeld } from '@modelEntities/creature';
import { ProjectData } from '@src/GlobalStateProvider';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectItems } from '@hooks/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import styled from 'styled-components';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';
import { IClickable, useShortcutNavigation } from '@hooks/useShortcutNavigation';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';

const ItemHeldStyle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  & span.chance {
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium};
  }

  &.clickable {
    :hover {
      text-decoration: underline;
    }
  }
`;

type ItemHeldComponentProps = {
  itemHeld: StudioItemHeld;
  items: ProjectData['items'];
  t: TFunction;
  clickable?: IClickable;
};

const ItemHeldComponent = ({ itemHeld, items, t, clickable }: ItemHeldComponentProps) => {
  const getItemName = useGetEntityNameText();
  return (
    <FieldData disabled={false} error={items[itemHeld.dbSymbol] === undefined}>
      {items[itemHeld.dbSymbol] === undefined ? (
        t('item_deleted')
      ) : (
        <ItemHeldStyle onClick={clickable?.isClickable ? clickable.callback : undefined} className={clickable?.isClickable ? 'clickable' : undefined}>
          {getItemName(items[itemHeld.dbSymbol])}
          <span className="chance">{`(${itemHeld.chance}%)`}</span>
        </ItemHeldStyle>
      )}
    </FieldData>
  );
};

export const EncounterDataBlock = ({ pokemonWithForm, dialogsRef }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { projectDataValues: items } = useProjectItems();
  const { t } = useTranslation();

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutNavigation = useShortcutNavigation('items', 'item', '/database/items');

  return (
    <DataBlockWithTitle size="fourth" title={t('encounter')} onClick={() => (isClickable ? null : dialogsRef.current?.openDialog('encounter'))}>
      <DataGrid columns="1fr" rows="42px 42px 1fr">
        <DataFieldsetField label={t('catch_rate')} data={form.catchRate} />
        <DataFieldsetField label={t('female_rate')} data={form.femaleRate === -1 ? t('genderless') : `${form.femaleRate} %`} />
        {form.itemHeld.length === 0 || (form.itemHeld[0].dbSymbol === 'none' && form.itemHeld[1].dbSymbol === 'none') ? (
          <DataFieldsetField label={t('items_held')} data={t('none_item')} disabled />
        ) : (
          <DataFieldsetFieldWithChild label={t('items_held')}>
            {[0, 1].map(
              (index) =>
                form.itemHeld[index].dbSymbol !== 'none' && (
                  <ItemHeldComponent
                    clickable={{ isClickable, callback: () => shortcutNavigation(form.itemHeld[index].dbSymbol) }}
                    key={index}
                    itemHeld={form.itemHeld[index]}
                    items={items}
                    t={t}
                  />
                )
            )}
          </DataFieldsetFieldWithChild>
        )}
      </DataGrid>
    </DataBlockWithTitle>
  );
};
