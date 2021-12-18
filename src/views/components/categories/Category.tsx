import styled from 'styled-components';

export const Category = styled.span`
  box-sizing: border-box;
  text-align: center;
  user-select: none;
  width: 75px;
  border-radius: 4px;
  padding: 4px;
  line-height: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.colors.dark18};
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text100};
`;

export const CategoryLarge = styled.span`
  box-sizing: border-box;
  text-align: center;
  user-select: none;
  width: 96px;
  border-radius: 4px;
  padding: 4px;
  line-height: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.colors.dark18};
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text100};
`;
