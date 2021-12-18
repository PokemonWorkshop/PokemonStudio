import styled from 'styled-components';

export const Toggle = styled.input.attrs(() => ({ type: 'checkbox' }))`
  appearance: none;
  width: 30px;
  height: 18px;
  padding: 2px;
  margin: 0;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.colors.dark24};
  transition: 0.2s;

  &:checked {
    background-color: ${({ theme }) => theme.colors.primaryBase};
  }

  &::before {
    content: '';
    background-color: ${({ theme }) => theme.colors.text100};
    position: relative;
    left: 0px;
    width: 14px;
    height: 14px;
    display: block;
    border-radius: 100%;
    transition: 0.2s;
  }

  &:checked::before {
    left: 12px;
  }
`;
