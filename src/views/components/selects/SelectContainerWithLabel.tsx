import styled from 'styled-components';

export const SelectContainerWithLabel = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  z-index: 10;

  & span {
    ${({ theme }) => theme.fonts.normalRegular};
    user-select: none;
  }
`;
