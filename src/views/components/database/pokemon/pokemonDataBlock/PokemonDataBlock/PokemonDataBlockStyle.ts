import styled from 'styled-components';
import {
  PokemonDataBlockStyleProps,
  sizeToPx,
} from './PokemonDataBlockPropsInterface';

export const PokemonDataBlockStyle = styled.div<PokemonDataBlockStyleProps>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.size ? sizeToPx[props.size].width : '244px')};
  height: ${(props) => (props.size ? sizeToPx[props.size].height : '254px')};
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colors.dark20};
  border-radius: 12px;

  h2 {
    margin-bottom: 24px;
  }
`;
