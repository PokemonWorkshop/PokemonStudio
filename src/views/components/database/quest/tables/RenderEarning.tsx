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
import { StudioQuestEarning, StudioQuestEarningCategoryType, StudioQuestEarningType } from '@modelEntities/quest';

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

  & :hover {
    .buttons:nth-child(3) {
      visibility: visible;
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
};

type RenderEarningProps = {
  earning: StudioQuestEarning;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

export const RenderEarning = ({ earning, onClickEdit, onClickDelete }: RenderEarningProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_quests');
  return (
    <RenderEarningContainer gap="48px">
      <span>{buildEarningText(earning, state)}</span>
      <EarningCategory category={categoryEarning[earning.earningMethodName]}>{t(categoryEarning[earning.earningMethodName])}</EarningCategory>
      <div className="buttons">
        <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
        <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
      </div>
    </RenderEarningContainer>
  );
};
