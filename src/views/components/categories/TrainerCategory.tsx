import styled from 'styled-components';
import { Category } from './Category';

type TrainerCategoryProps = { category: 'double' | 'triple' };

export const TrainerCategory = styled(Category).attrs<TrainerCategoryProps>((props) => ({
  'data-category': props.category,
}))<TrainerCategoryProps>`
  &[data-category='double'] {
    background: rgba(178, 146, 247, 0.12);
    color: rgba(178, 146, 247, 1);
  }
  &[data-category='triple'] {
    background: rgba(245, 171, 61, 0.12);
    color: rgba(245, 171, 61, 1);
  }
`;
