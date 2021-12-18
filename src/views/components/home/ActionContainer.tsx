import styled from 'styled-components';

export const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 64px;
`;

export const BrandingActionContainer = styled.div`
  display: grid;
  grid-template-rows: 64px 40px;
  grid-template-columns: 1fr 1fr;
  row-gap: 32px;
  column-gap: 16px;
  & a {
    width: 240px;
  }
`;

export const BrandingTitleContainer = styled.div`
  display: flex;
  gap: 24px;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
`;

export const BrandingTitle = styled.span`
  ${({ theme }) => theme.fonts.titlesStudio}
`;

export const RecentProjectContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text400};
`;

export const ProjectCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 240px;
  overflow-y: hidden;
  gap: 16px;
`;
