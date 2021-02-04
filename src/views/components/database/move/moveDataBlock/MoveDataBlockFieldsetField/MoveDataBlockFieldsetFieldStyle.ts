import styled from 'styled-components';
import {
  MoveDataBlockFieldsetFieldStyleProps,
  sizeToPx,
} from './MoveDataBlockFieldsetFieldPropsInterface';

export const MoveDataBlockFieldsetFieldStyle = styled.div<
  MoveDataBlockFieldsetFieldStyleProps
>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: ${(props) => (props.size ? sizeToPx[props.size].width : '150px')};

  span {
    font-size: 14px;
    &:nth-child(1) {
      color: ${(props) => props.theme.colors.text400};
      user-select: none;
    }

    &:nth-child(2) {
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
