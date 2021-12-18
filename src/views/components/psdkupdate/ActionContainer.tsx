import styled from 'styled-components';

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const BrandingActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
`;

export const BrandingTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const BrandingButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 240px;

  & span {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.successBase};
    align-self: center;
  }
`;

export const BrandingTitle = styled.div`
  margin: 0;
  padding: 0;
  ${({ theme }) => theme.fonts.titlesStudio}
`;

export const BrandingCurrentVersion = styled.div`
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text400}
`;
