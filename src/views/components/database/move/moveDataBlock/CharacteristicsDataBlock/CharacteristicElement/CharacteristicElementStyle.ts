import styled from 'styled-components';

export const CharacteristicElementStyle = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  ${({ theme }) => theme.fonts.normalMedium};
  line-height: 19px;
  background-color: ${({ theme }) => theme.colors.dark18};
  color: ${({ theme }) => theme.colors.text100};
  white-space: nowrap;
`;
