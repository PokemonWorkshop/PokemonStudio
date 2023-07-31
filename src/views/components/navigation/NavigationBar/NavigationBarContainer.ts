import styled from 'styled-components';

export const NavigationBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dark16} !important;
  min-width: 72px;
  padding: 16px 12px;
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  .navigation-bar-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }
`;
