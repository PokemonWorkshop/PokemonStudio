import styled from 'styled-components';
import { PokemonBattlerListComponent, PokemonBattlerListGrid, PokemonBattlerListHeader } from '@components/pokemonBattler/PokemonBattlerList';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { DarkButton, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ItemBagEntry } from './ItemBagEntry';
import { StudioTrainerBagEntry } from '@modelEntities/trainer';
import { BagEntryEditorOverlay, type BagEntryEditorAndDeletionKeys, type BagEntryFrom } from './editors/BagEntryEditorOverlay';
import { useDialogsRef } from '@utils/useDialogsRef';

type BagEntryListProps = {
  title: string;
  bagEntries: StudioTrainerBagEntry[];
  disabledImport: boolean;
  from: BagEntryFrom;
};

const BagEntryListComponent = styled(PokemonBattlerListComponent)``;
const BagEntryListHeader = styled(PokemonBattlerListHeader)``;
const BagEntryListGrid = styled(PokemonBattlerListGrid)``;

export const BagEntryList = ({ title, bagEntries, disabledImport, from }: BagEntryListProps) => {
  const dialogsRef = useDialogsRef<BagEntryEditorAndDeletionKeys>();
  const { t } = useTranslation('bag_entry_list');
  const [index, setIndex] = useState<number>(0);

  return (
    <BagEntryListComponent size="full" data-noactive>
      <BagEntryListHeader>
        <div className="title">{title}</div>
        <div className="buttons">
          <div className="button-import-full">
            <DarkButton onClick={() => dialogsRef.current?.openDialog('import')} disabled={disabledImport}>
              {t('import_item')}
            </DarkButton>
          </div>
          <div className="button-import-reduce">
            <DarkButton onClick={() => dialogsRef.current?.openDialog('import')} disabled={disabledImport}>
              {t('import')}
            </DarkButton>
          </div>
          <SecondaryButtonWithPlusIconResponsive onClick={() => dialogsRef.current?.openDialog('new')} data-tooltip={t('add_item')}>
            {t('add_item')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </BagEntryListHeader>
      {bagEntries.length === 0 ? (
        <span className="no-data">{t('no_item')}</span>
      ) : (
        <BagEntryListGrid>
          {bagEntries.map((bagEntry, index) => (
            <ItemBagEntry key={`item-bag-entry-${index}`} dialogsRef={dialogsRef} bagEntry={bagEntry} from={from} index={index} setIndex={setIndex} />
          ))}
        </BagEntryListGrid>
      )}
      <BagEntryEditorOverlay ref={dialogsRef} index={index} from={from} />
    </BagEntryListComponent>
  );
};
