import styled from 'styled-components';

export const CharacteristicsDataBlockStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const NoCharacteristic = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text500}
`;
