import styled from 'styled-components';

export const RadioInput = styled.input.attrs(() => ({ type: 'radio' }))`
  appearance: none;
  width: 18px;
  height: 18px;
  padding: 0;
  margin: 0;
  border-radius: 100px;
  border: 2px solid ${({ theme }) => theme.colors.dark24};

  :hover {
    cursor: pointer;
  }

  &:checked {
    border: 2px solid ${({ theme }) => theme.colors.primaryBase};
  }

  &:disabled {
    border: 2px solid ${({ theme }) => theme.colors.dark22};
  }

  &:checked::before,
  &:disabled::before {
    content: '';
    position: relative;
    display: block;
    left: 2px;
    top: 2px;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.colors.primaryBase};
  }

  &:disabled::before {
    background-color: ${({ theme }) => theme.colors.dark22};
  }
`;
