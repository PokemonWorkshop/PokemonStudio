import { DataBlockContainer } from '@components/database/dataBlocks';
import { hexToRgba } from '@utils/ColorUtils';
import styled from 'styled-components';

export const ChartBlockContainer = styled(DataBlockContainer)`
  gap: 20px;
`;

export const ChartBlockTitle = styled.h2`
  margin: 0;
  user-select: none;
`;

export const ChartLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media screen and (max-width: 720px) {
    flex-direction: column;
  }
`;

export const ChartWrapper = styled.div`
  flex-shrink: 0;
  width: 200px;
  height: 200px;
`;

export const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
  flex: 1;
  min-width: 0;

  @media screen and (max-width: 720px) {
    width: 100%;
  }
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const LegendIconBadge = styled.span<{ typeColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
  background: ${({ typeColor }) => hexToRgba(typeColor, 0.12)};
  color: ${({ typeColor }) => hexToRgba(typeColor, 1)};

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const LegendLabel = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text100};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LegendCount = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
  margin-left: auto;
  flex-shrink: 0;
`;
