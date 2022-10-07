import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  &.active > div {
    background-color: ${({ theme }) => theme.colors.primarySoft};

    svg {
      color: ${({ theme }) => theme.colors.primaryBase};
    }
  }
`;

export const StyledNavLinkActionItem = styled.a`
  &[data-disabled='false']:active > div {
    background-color: ${({ theme }) => theme.colors.primarySoft};

    svg {
      color: ${({ theme }) => theme.colors.primaryBase};
    }
  }

  &[data-disabled='true'] {
    color: ${({ theme }) => theme.colors.text700};
  }

  &[data-disabled='false']:hover {
    cursor: pointer;
  }
`;
