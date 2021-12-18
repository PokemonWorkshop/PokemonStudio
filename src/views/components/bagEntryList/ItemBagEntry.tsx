import React from 'react';
import styled from 'styled-components';
import { PokemonBattlerContainer } from '@components/pokemonBattlerList/PokemonBattler';
import { useGlobalState } from '@src/GlobalStateProvider';
import { BagEntry } from '@modelEntities/trainer/Trainer.model';
import { useProjectItems } from '@utils/useProjectData';
import { Tag } from '@components/Tag';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { useTranslation } from 'react-i18next';

type ItemBagEntryProps = {
  onClickDelete: (index: number) => void;
  onClickEdit: (index: number) => void;
  bagEntry: BagEntry;
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
  const [state] = useGlobalState();
  const { projectDataValues: items } = useProjectItems();
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
        {item ? (
          <img
            draggable="false"
            src={state.projectPath ? item.iconUrl(state.projectPath) : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'}
            alt=""
          />
        ) : (
          <img
            draggable="false"
            src={
              state.projectPath ? `${state.projectPath}/graphics/pokedex/pokeicon/000.png` : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'
            }
          />
        )}
        {item ? <span>{item.name()}</span> : <span className="error">{t('item_deleted')}</span>}
        <div className="amount-delete-button">
          <Tag className="amount">{`x${bagEntry.amount}`}</Tag>
          <ClearButtonOnlyIcon className="delete-button" onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDelete(event)} />
        </div>
      </ItemBagEntryHeader>
    </ItemBagEntryContainer>
  );
};
