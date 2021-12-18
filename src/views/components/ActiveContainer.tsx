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
    border-width: 2px;
    padding: 23px;
    border-color: ${({ theme }) => theme.colors.dark24};
  }

  &.active:not([data-disabled='true']),
  &:active:not([data-disabled='true']):not([data-noactive='true']):not(:focus-within) {
    background-color: ${({ theme }) => theme.colors.dark15};
    border-width: 2px;
    padding: 23px;
    border-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;
