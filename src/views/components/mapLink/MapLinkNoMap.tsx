import styled from 'styled-components';

export const MapLinkNoMap = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;
