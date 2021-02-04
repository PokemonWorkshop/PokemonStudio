import styled from 'styled-components';
import {
  PokemonDataBlockFieldsetStyleProps,
  sizeToPx,
} from './PokemonDataBlockFieldsetPropsInterface';

export const PokemonDataBlockFieldsetStyle = styled.div<
  PokemonDataBlockFieldsetStyleProps
>`
  display: flex;
  min-height: 186px;
  box-sizing: border-box;
  flex-direction: column;
  align-content: flex-start;
  flex-wrap: wrap;
  row-gap: ${(props) => (props.size ? sizeToPx[props.size].gap : '16px')};
  column-gap: 0;
`;
