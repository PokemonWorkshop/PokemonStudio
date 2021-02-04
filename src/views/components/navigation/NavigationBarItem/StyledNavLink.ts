import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  &.active > div {
    background-color: rgba(101, 98, 248, 0.12);

    svg {
      color: #6562f8;
    }
  }
`;
