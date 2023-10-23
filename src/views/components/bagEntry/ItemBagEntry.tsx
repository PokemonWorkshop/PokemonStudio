import React, { Dispatch } from 'react';
import styled from 'styled-components';
import { PokemonBattlerContainer } from '@components/pokemonBattler/PokemonBattler';
import { useProjectItems } from '@utils/useProjectData';
import { Tag } from '@components/Tag';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { itemIconPath } from '@utils/path';
import { StudioTrainerBagEntry } from '@modelEntities/trainer';
import { ResourceImage } from '@components/ResourceImage';
import { useShortcutNavigation } from '@utils/useShortcutNavigation';
import { CONTROL, useKeyPress } from '@utils/useKeyPress';
import type { BagEntryDialogsRef, BagEntryFrom } from './editors/BagEntryEditorOverlay';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useTrainerPage } from '@utils/usePage';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { cloneEntity } from '@utils/cloneEntity';

type ItemBagEntryProps = {
  dialogsRef: BagEntryDialogsRef;
  bagEntry: StudioTrainerBagEntry;
  from: BagEntryFrom;
  index: number;
  setIndex: Dispatch<React.SetStateAction<number>>;
};

const ItemBagEntryContainer = styled(PokemonBattlerContainer)`
  width: 100%;

  :hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    border: 2px solid ${({ theme }) => theme.colors.dark20};
    padding: 15px;

    .delete-button {
      display: flex;
      width: 40px;
    }

    .amount {
      display: none;
    }
  }
`;

const ItemBagEntryHeader = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 62px;
  gap: 12px;
  align-items: center;
  height: 40px;

  & img {
    max-width: 32px;
    max-height: 32px;
  }

  & div.amount-delete-button {
    display: flex;
    justify-content: right;
    align-items: center;

    .amount {
      height: 27px;
      box-sizing: border-box;
    }
  }

  & .delete-button {
    display: none;
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

export const ItemBagEntry = ({ dialogsRef, bagEntry, from, index, setIndex }: ItemBagEntryProps) => {
  const { projectDataValues: items } = useProjectItems();
  const getItemName = useGetEntityNameText();
  const item = items[bagEntry.dbSymbol];
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const { t } = useTranslation('database_items');
  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');

  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    switch (from) {
      case 'trainer': {
        const newBagEntries = cloneEntity(trainer.bagEntries);
        newBagEntries.splice(index, 1);
        return updateTrainer({ bagEntries: newBagEntries });
      }
      default:
        assertUnreachable(from);
    }
  };

  const onEdit = (event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
    event.stopPropagation();
    setIndex(index);
    dialogsRef.current?.openDialog('edit');
  };

  return (
    <ItemBagEntryContainer onClick={isClickable ? undefined : onEdit}>
      <ItemBagEntryHeader>
        <ResourceImage imagePathInProject={itemIconPath(item?.icon || '000.png')} />
        {item ? (
          <span onClick={isClickable ? () => shortcutItemNavigation(item.dbSymbol) : undefined} className={isClickable ? 'clickable' : undefined}>
            {getItemName(item)}
          </span>
        ) : (
          <span className="error">{t('item_deleted')}</span>
        )}
        <div className="amount-delete-button">
          <Tag className="amount">{`x${bagEntry.amount}`}</Tag>
          <ClearButtonOnlyIcon className="delete-button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDelete(event)} />
        </div>
      </ItemBagEntryHeader>
    </ItemBagEntryContainer>
  );
};
