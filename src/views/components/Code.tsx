import styled from 'styled-components';

export const Code = styled.span`
  display: inline-block;
  width: max-content;
  background-color: ${({ theme }) => theme.colors.dark8};
  border-radius: 4px;
  padding: 4px 8px;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text100};
`;
