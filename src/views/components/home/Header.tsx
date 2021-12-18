import styled from 'styled-components';

export const Header = styled.div`
  text-align: right;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text500};
`;
