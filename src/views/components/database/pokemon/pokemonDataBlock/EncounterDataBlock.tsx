import { DataFieldsetFieldWithChild, FieldData } from '@components/database/dataBlocks/DataFieldsetField';
import { StudioItemHeld } from '@modelEntities/creature';
import { ProjectData } from '@src/GlobalStateProvider';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectItems } from '@utils/useProjectData';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

const ItemHeldStyle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  & span.chance {
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium};
  }
`;

type ItemHeldComponentProps = {
  itemHeld: StudioItemHeld;
  items: ProjectData['items'];
  t: TFunction<('database_pokemon' | 'database_items')[]>;
};

const ItemHeldComponent = ({ itemHeld, items, t }: ItemHeldComponentProps) => {
  const getItemName = useGetEntityNameText();
  return (
    <FieldData disabled={false} error={items[itemHeld.dbSymbol] === undefined}>
      {items[itemHeld.dbSymbol] === undefined ? (
        t('database_items:item_deleted')
      ) : (
        <ItemHeldStyle>
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
  const { t } = useTranslation(['database_pokemon', 'database_items']);

  return (
    <DataBlockWithTitle size="fourth" title={t('database_pokemon:encounter')} onClick={() => dialogsRef.current?.openDialog('encounter')}>
      <DataGrid columns="1fr" rows="42px 42px 1fr">
        <DataFieldsetField label={t('database_pokemon:catch_rate')} data={form.catchRate} />
        <DataFieldsetField
          label={t('database_pokemon:female_rate')}
          data={form.femaleRate === -1 ? t('database_pokemon:genderless') : `${form.femaleRate} %`}
        />
        {form.itemHeld.length === 0 || (form.itemHeld[0].dbSymbol === 'none' && form.itemHeld[1].dbSymbol === 'none') ? (
          <DataFieldsetField label={t('database_pokemon:items_held')} data={t('database_pokemon:none_item')} disabled />
        ) : (
          <DataFieldsetFieldWithChild label={t('database_pokemon:items_held')}>
            {form.itemHeld[0].dbSymbol !== 'none' && <ItemHeldComponent itemHeld={form.itemHeld[0]} items={items} t={t} />}
            {form.itemHeld[1].dbSymbol !== 'none' && <ItemHeldComponent itemHeld={form.itemHeld[1]} items={items} t={t} />}
          </DataFieldsetFieldWithChild>
        )}
      </DataGrid>
    </DataBlockWithTitle>
  );
};
