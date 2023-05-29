import styled from 'styled-components';

export const ActiveContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;

  &:hover:not([data-disabled='true']):not([data-noactive='true']) {
    background-color: ${({ theme }) => theme.colors.dark14};
    border-color: ${({ theme }) => theme.colors.dark24};
    outline: 2px solid ${({ theme }) => theme.colors.dark24};
    cursor: pointer;
  }

  &.active:not([data-disabled='true']),
  &:active:not([data-disabled='true']):not([data-noactive='true']):not(:focus-within) {
    background-color: ${({ theme }) => theme.colors.dark15};
    border-color: ${({ theme }) => theme.colors.primaryBase};
    outline: 2px solid ${({ theme }) => theme.colors.primaryBase};
  }
`;
