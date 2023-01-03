import styled from 'styled-components';
import { Category } from './Category';
import { StudioDexType } from '@modelEntities/dex';

type DexCategoryProps = { category: StudioDexType };

export const DexCategory = styled(Category).attrs<DexCategoryProps>((props) => ({
  'data-category': props.category,
}))<DexCategoryProps>`
  &[data-category='national'] {
    background: rgba(247, 189, 38, 0.12);
    color: rgba(247, 189, 38, 1);
  }

  &[data-category='regional'] {
    background: rgba(195, 181, 178, 0.12);
    color: rgba(195, 181, 178, 1);
  }
`;
