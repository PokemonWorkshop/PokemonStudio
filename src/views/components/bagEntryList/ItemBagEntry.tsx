import React from 'react';
import styled from 'styled-components';
import { PokemonBattlerContainer } from '@components/pokemonBattlerList/PokemonBattler';
import { useProjectItems } from '@utils/useProjectData';
import { Tag } from '@components/Tag';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { itemIconPath } from '@utils/path';
import { StudioTrainerBagEntry } from '@modelEntities/trainer';
import { ResourceImage } from '@components/ResourceImage';

type ItemBagEntryProps = {
  onClickDelete: (index: number) => void;
  onClickEdit: (index: number) => void;
  bagEntry: StudioTrainerBagEntry;
  index: number;
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
`;

export const ItemBagEntry = ({ onClickDelete, onClickEdit, bagEntry, index }: ItemBagEntryProps) => {
  const { projectDataValues: items } = useProjectItems();
  const getItemName = useGetEntityNameText();
  const item = items[bagEntry.dbSymbol];
  const { t } = useTranslation('database_items');

  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClickDelete(index);
  };

  const onEdit = (event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => {
    event.stopPropagation();
    onClickEdit(index);
  };

  return (
    <ItemBagEntryContainer onClick={onEdit}>
      <ItemBagEntryHeader>
        <ResourceImage imagePathInProject={itemIconPath(item?.icon || '000.png')} />
        {item ? <span>{getItemName(item)}</span> : <span className="error">{t('item_deleted')}</span>}
        <div className="amount-delete-button">
          <Tag className="amount">{`x${bagEntry.amount}`}</Tag>
          <ClearButtonOnlyIcon className="delete-button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDelete(event)} />
        </div>
      </ItemBagEntryHeader>
    </ItemBagEntryContainer>
  );
};
