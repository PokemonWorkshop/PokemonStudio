import styled from 'styled-components';
import { ActiveContainer } from '@components/ActiveContainer';
import { CopyStyle } from '@components/Copy';

export type DataBlockCOntainerSize = 'full' | 'half' | 'fourth' | 'default';
export type DataBlockContainerColor = 'light' | 'dark' | 'warning';
export type DataBlockContainerProps = {
  size: DataBlockCOntainerSize;
  color?: DataBlockContainerColor;
};

/**
 * Block that is expected to contain data.
 * This version only define the border and the background.
 */
export const DataBlockContainer = styled(ActiveContainer)<DataBlockContainerProps>`
  margin: 0 8px;
  max-width: ${({ theme, size }) => theme.sizes[size].max}px;
  min-width: ${({ theme, size }) => theme.sizes[size].min}px;
  width: calc(${({ theme, size }) => theme.sizes[size].middle}% - 16px);
  user-select: none;

  ${({ theme, color }) =>
    color === 'light' &&
    `
    background-color: ${theme.colors.dark16};
    border: none;
  `};

  ${({ theme, color }) =>
    color === 'warning' &&
    `
    background-color: ${theme.colors.warningSoft};
    border-color: ${theme.colors.warningSoft};
  `};

  ${CopyStyle} {
    display: none;
  }

  :hover {
    ${CopyStyle} {
      display: inline-block;
    }
  }

  &[data-disabled='true'] {
    pointer-events: none;
  }
`;
