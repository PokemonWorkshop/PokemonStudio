import styled from 'styled-components';
import { PokemonBattlerListComponent, PokemonBattlerListGrid, PokemonBattlerListHeader } from '@components/pokemonBattler/PokemonBattlerList';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { DarkButtonImportResponsive, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ItemBagEntry } from './ItemBagEntry';
import { StudioTrainer } from '@modelEntities/trainer';
import { BagEntryEditorOverlay, type BagEntryEditorAndDeletionKeys, type BagEntryFrom } from './editors/BagEntryEditorOverlay';
import { useDialogsRef } from '@hooks/useDialogsRef';

type BagEntryListProps = {
  title: string;
  trainer: StudioTrainer;
  disabledImport: boolean;
  from: BagEntryFrom;
};

const BagEntryListComponent = styled(PokemonBattlerListComponent)``;
const BagEntryListHeader = styled(PokemonBattlerListHeader)``;
const BagEntryListGrid = styled(PokemonBattlerListGrid)``;

export const BagEntryList = ({ title, trainer, disabledImport, from }: BagEntryListProps) => {
  const dialogsRef = useDialogsRef<BagEntryEditorAndDeletionKeys>();
  const { t } = useTranslation();
  const [index, setIndex] = useState<number>(0);
  const bagEntries = trainer.bagEntries;

  return (
    <BagEntryListComponent size="full" data-noactive>
      <BagEntryListHeader>
        <div className="title">{title}</div>
        <div className="buttons">
          <DarkButtonImportResponsive
            onClick={() => dialogsRef.current?.openDialog('import')}
            data-tooltip-responsive={t('import_item')}
            disabled={disabledImport}
          >
            {t('import_item')}
          </DarkButtonImportResponsive>
          <SecondaryButtonWithPlusIconResponsive onClick={() => dialogsRef.current?.openDialog('new')} data-tooltip-responsive={t('add_item')}>
            {t('add_item')}
          </SecondaryButtonWithPlusIconResponsive>
        </div>
      </BagEntryListHeader>
      {bagEntries.length === 0 ? (
        <span className="no-data">{t('no_item')}</span>
      ) : (
        <BagEntryListGrid>
          {bagEntries.map((bagEntry, index) => (
            <ItemBagEntry
              key={`item-bag-entry-${index}`}
              dialogsRef={dialogsRef}
              bagEntry={bagEntry}
              from={from}
              index={index}
              trainer={trainer}
              setIndex={setIndex}
            />
          ))}
        </BagEntryListGrid>
      )}
      <BagEntryEditorOverlay ref={dialogsRef} index={index} from={from} />
    </BagEntryListComponent>
  );
};
