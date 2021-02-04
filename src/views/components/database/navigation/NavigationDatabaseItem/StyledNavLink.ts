import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  left: 16px;
  top: 8px;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 19px;
  text-decoration: none;

  &.active > div {
    background-color: ${(props) => props.theme.colors.dark19};
    color: ${(props) => props.theme.colors.text100};
  }
`;
