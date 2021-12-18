import styled from 'styled-components';

export const NavigationDatabaseStyle = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 216px;
  gap: 24px;
  padding: 24px 12px;
  margin-left: 2px;
  background: ${({ theme }) => theme.colors.dark16};
  border-radius: 2px;
  user-select: none;
`;
