import styled from 'styled-components';
import ButtonProps from './ButtonPropsInterface';

export const BaseButtonStyle = styled.a<ButtonProps>`
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  display: flex;
  align-items: center;
  margin-right: 10px;
  padding: 0 16px;
  height: 40px;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  border-radius: 8px;
  gap: 4px;
  font-size: 14px;

  &:visited {
    text-decoration: none;
  }

  &:hover {
    cursor: pointer;
  }
`;
