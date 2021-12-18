import styled from 'styled-components';
import { Category } from './Category';
import { EarningCategoryType } from '@modelEntities/quest/Quest.model';

type EarningCategoryProps = { category: EarningCategoryType };

export const EarningCategory = styled(Category).attrs<EarningCategoryProps>((props) => ({
  'data-category': props.category,
}))<EarningCategoryProps>`
  &[data-category='money'] {
    background: rgba(247, 189, 38, 0.12);
    color: rgba(247, 189, 38, 1);
  }

  &[data-category='item'] {
    background: rgba(193, 114, 255, 0.12);
    color: rgba(193, 114, 255, 1);
  }

  &[data-category='pokemon'] {
    background: rgba(53, 175, 243, 0.12);
    color: rgba(53, 175, 243, 1);
  }
`;
