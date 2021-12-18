import styled from 'styled-components';
import { PokemonBattlerListComponent, PokemonBattlerListGrid, PokemonBattlerListHeader } from '@components/pokemonBattlerList/PokemonBattlerList';
import { BagEntry } from '@modelEntities/trainer/Trainer.model';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { DarkButton, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ItemBagEntry } from './ItemBagEntry';

type BagEntryListProps = {
  title: string;
  onClickAdd: () => void;
  onClickImport: () => void;
  onClickDelete: (index: number) => void;
  onClickEdit: (index: number) => void;
  bagEntries: BagEntry[];
  disabledImport: boolean;
};

const BagEntryListComponent = styled(PokemonBattlerListComponent)``;
const BagEntryListHeader = styled(PokemonBattlerListHeader)``;
const BagEntryListGrid = styled(PokemonBattlerListGrid)``;

export const BagEntryList = ({ title, onClickAdd, onClickImport, onClickDelete, onClickEdit, bagEntries, disabledImport }: BagEntryListProps) => {
  const { t } = useTranslation('bag_entry_list');

  return (
    <BagEntryListComponent size="full" data-noactive>
      <BagEntryListHeader>
        <div className="title">{title}</div>
        <div className="buttons">
          <div className="button-import-full">
            <DarkButton onClick={onClickImport} disabled={disabledImport}>
              {t('import_item')}
            </DarkButton>
          </div>
          <div className="button-import-reduce">
            <DarkButton onClick={onClickImport} disabled={disabledImport}>
              {t('import')}
            </DarkButton>
          </div>
          <SecondaryButtonWithPlusIconResponsive onClick={onClickAdd} tooltip={{ right: '100%', top: '100%' }}>
            {t('add_item')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </BagEntryListHeader>
      {bagEntries.length === 0 ? (
        <span className="no-data">{t('no_item')}</span>
      ) : (
        <BagEntryListGrid>
          {bagEntries.map((bagEntry, index) => (
            <ItemBagEntry key={`item-bag-entry-${index}`} onClickDelete={onClickDelete} onClickEdit={onClickEdit} bagEntry={bagEntry} index={index} />
          ))}
        </BagEntryListGrid>
      )}
    </BagEntryListComponent>
  );
};
