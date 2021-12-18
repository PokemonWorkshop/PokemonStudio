import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const NavigationDatabaseItemStyle = styled.div`
  padding: 8px 16px;
  border-radius: 8px;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

export const StyledNavLink = styled(NavLink)`
  text-decoration: none;

  &.active > div {
    background-color: ${({ theme }) => theme.colors.dark19};
    color: ${({ theme }) => theme.colors.text100};
  }
`;
