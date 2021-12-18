import styled from 'styled-components';

export const DeletionContainer = styled.div`
  width: 512px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 8px;
  user-select: none;
`;
