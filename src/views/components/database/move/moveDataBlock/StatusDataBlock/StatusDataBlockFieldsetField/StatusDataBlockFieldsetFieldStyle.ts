import styled from 'styled-components';
import { StatusDataBlockFieldsetFieldStyleProps } from './StatusDataBlockFieldsetFieldPropsInterface';

export const StatusDataBlockFieldsetFieldStyle = styled.div<
  StatusDataBlockFieldsetFieldStyleProps
>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 152px;

  span {
    font-size: 14px;
    &:nth-child(1) {
      color: ${(props) => props.theme.colors.text400};
      user-select: none;
    }

    &:nth-child(2) {
      font-weight: 500;
      color: ${(props) =>
        props.data === 'none'
          ? props.theme.colors.text500
          : props.theme.colors.text100};
    }
  }
`;
