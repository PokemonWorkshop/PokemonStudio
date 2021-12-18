import styled from 'styled-components';

export const NavigationDatabaseGroupStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    ${({ theme }) => theme.fonts.titlesOverline};
    line-height: 14px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text500};
  }
`;
