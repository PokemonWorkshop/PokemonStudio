import styled from 'styled-components';

/*
 * Text links had no hover affordance at all -- the footer's documentation /
 * getting-started / discord / twitter row read as static text. A colour shift
 * plus an underline that wipes in from the left (transform-based, so it's
 * compositor-only) gives a clear "this is interactive" signal without moving
 * any layout.
 */
const LinkStyle = styled.a`
  position: relative;
  color: ${(props) => props.theme.colors.text100};
  text-decoration: none;
  transition: color 150ms ${({ theme }) => theme.motion.easeOut};

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 150ms ${({ theme }) => theme.motion.easeOut};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBase};
  }

  &:hover::after {
    transform: scaleX(1);
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &::after {
      transition: none;
    }
  }
`;

export default LinkStyle;
