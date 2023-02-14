import styled from 'styled-components';
import { Category } from './Category';
import { StudioItemCategory } from '@modelEntities/item';

type ItemCategoryProps = { category: StudioItemCategory };

export const ItemCategory = styled(Category).attrs<ItemCategoryProps>((props) => ({
  'data-category': props.category,
}))<ItemCategoryProps>`
  &[data-category='ball'] {
    background: rgba(238, 148, 116, 0.12);
    color: rgba(238, 148, 116, 1);
  }

  &[data-category='heal'] {
    background: rgba(37, 203, 44, 0.12);
    color: rgba(37, 203, 44, 1);
  }

  &[data-category='repel'] {
    background: rgba(69, 150, 237, 0.12);
    color: rgba(69, 150, 237, 1);
  }

  &[data-category='fleeing'] {
    background: rgba(178, 146, 247, 0.12);
    color: rgba(178, 146, 247, 1);
  }

  &[data-category='event'] {
    background: rgba(185, 171, 168, 0.12);
    color: rgba(185, 171, 168, 1);
  }

  &[data-category='stone'] {
    background: rgba(245, 171, 61, 0.12);
    color: rgba(245, 171, 61, 1);
  }

  &[data-category='tech'] {
    background: rgba(234, 131, 131, 0.12);
    color: rgba(234, 131, 131, 1);
  }

  &[data-category='generic'] {
    background: rgba(221, 125, 180, 0.12);
    color: rgba(221, 125, 180, 1);
  }
`;
