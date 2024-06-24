import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { EarningCategory } from '@components/categories';
import { DataEarningGrid } from './QuestTableStyle';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import theme from '@src/AppTheme';
import { useGlobalState } from '@src/GlobalStateProvider';
import { buildEarningText } from '@utils/QuestUtils';
import { StudioQuestCategoryClickable, StudioQuestEarning, StudioQuestEarningCategoryType, StudioQuestEarningType } from '@modelEntities/quest';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation, useShortcutNavigation } from '@hooks/useShortcutNavigation';

const RenderEarningContainer = styled(DataEarningGrid)`
  box-sizing: border-box;
  height: 40px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;

  & .buttons:nth-child(3) {
    display: flex;
    gap: 4px;
    justify-content: end;
    align-items: center;
    visibility: hidden;
  }

  &:hover {
    .buttons:nth-child(3) {
      visibility: visible;
    }
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  ${EditButtonOnlyIconContainer} {
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }
`;

const categoryEarning: Record<StudioQuestEarningType, StudioQuestEarningCategoryType> = {
  earning_money: 'money',
  earning_item: 'item',
  earning_pokemon: 'pokemon',
  earning_egg: 'egg',
};

const categoryClickable: Record<StudioQuestEarningType, StudioQuestCategoryClickable | null> = {
  earning_money: null,
  earning_item: 'item',
  earning_pokemon: 'pokemon',
  earning_egg: 'pokemon',
};

type RenderEarningProps = {
  earning: StudioQuestEarning;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

export const RenderEarning = ({ earning, onClickEdit, onClickDelete }: RenderEarningProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_quests');
  const earningText: string = buildEarningText(earning, state);
  const earningClickable: boolean = categoryClickable[earning.earningMethodName] ? true : false;
  const isClickable: boolean = useKeyPress(CONTROL) && earningClickable && !earningText.includes('???');
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');

  const shortcutToTheRightPlace = () => {
    const dbSymbol = earning.earningArgs[0] as string;
    if (!dbSymbol) return;
    if (categoryClickable[earning.earningMethodName] === 'pokemon') {
      // TODO implement form
      return shortcutPokemonNavigation(dbSymbol, 0);
    }

    if (categoryClickable[earning.earningMethodName] === 'item') {
      return shortcutItemNavigation(dbSymbol);
    }
  };

  return (
    <RenderEarningContainer gap="48px">
      <span onClick={isClickable ? () => shortcutToTheRightPlace() : undefined} className={isClickable ? 'clickable' : undefined}>
        {earningText}
      </span>
      <EarningCategory category={categoryEarning[earning.earningMethodName]}>{t(categoryEarning[earning.earningMethodName])}</EarningCategory>
      <div className="buttons">
        <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
        <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
      </div>
    </RenderEarningContainer>
  );
};
