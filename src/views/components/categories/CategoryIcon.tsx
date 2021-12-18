import styled from 'styled-components';

export const CategoryIcon = styled.span`
  box-sizing: border-box;
  user-select: none;
  width: 40px;
  height: 24px;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark18};
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text100};
`;
