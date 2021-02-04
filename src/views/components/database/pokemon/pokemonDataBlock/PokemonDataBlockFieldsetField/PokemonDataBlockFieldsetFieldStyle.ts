import styled from 'styled-components';
import {
  PokemonDataBlockFieldsetFieldStyleProps,
  sizeToPx,
} from './PokemonDataBlockFieldsetFieldPropsInterface';

export const PokemonDataBlockFieldsetFieldStyle = styled.div<
  PokemonDataBlockFieldsetFieldStyleProps
>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => (props.size ? sizeToPx[props.size].gap : '4px')};
  width: 152px;

  span {
    font-size: 14px;
    &:nth-child(1) {
      color: ${(props) => props.theme.colors.text400};
    }

    &:nth-child(2) {
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
