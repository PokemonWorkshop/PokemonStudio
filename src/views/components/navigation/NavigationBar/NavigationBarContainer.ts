import styled from 'styled-components';

export const NavigationBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #222127;
  min-width: 72px;
  align-items: center;
  padding: 16px 0;
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
`;
