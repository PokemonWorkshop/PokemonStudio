import styled from 'styled-components';

export const SeparatorGreyLine = styled.div`
  display: block;
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.dark20};
`;
