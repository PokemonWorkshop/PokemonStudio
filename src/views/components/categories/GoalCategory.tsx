import { StudioQuestObjectiveCategoryType } from '@modelEntities/quest';
import styled from 'styled-components';
import { Category } from './Category';

type GoalCategoryProps = { category: StudioQuestObjectiveCategoryType };

export const GoalCategory = styled(Category).attrs<GoalCategoryProps>((props) => ({
  'data-category': props.category,
}))<GoalCategoryProps>`
  width: 88px;

  &[data-category='interaction'] {
    background: rgba(245, 171, 61, 0.12);
    color: rgba(245, 171, 61, 1);
  }

  &[data-category='battle'] {
    background: rgba(234, 131, 131, 0.12);
    color: rgba(234, 131, 131, 1);
  }

  &[data-category='discovery'] {
    background: rgba(37, 203, 44, 0.12);
    color: rgba(37, 203, 44, 1);
  }

  &[data-category='exploration'] {
    background: rgba(69, 150, 237, 0.12);
    color: rgba(69, 150, 237, 1);
  }
`;
