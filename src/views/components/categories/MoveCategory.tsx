import styled from 'styled-components';
import { Category } from './Category';

type MoveCategoryProps = { category: string };

export const MoveCategory = styled(Category).attrs<MoveCategoryProps>((props) => ({
  'data-category': props.category,
}))<MoveCategoryProps>`
  &[data-category='physical'] {
    background: rgba(247, 189, 38, 0.12);
    color: rgba(247, 189, 38, 1);
  }

  &[data-category='special'] {
    background: rgba(53, 175, 243, 0.12);
    color: rgba(53, 175, 243, 1);
  }

  &[data-category='status'] {
    background: rgba(193, 114, 255, 0.12);
    color: rgba(193, 114, 255, 1);
  }
`;
