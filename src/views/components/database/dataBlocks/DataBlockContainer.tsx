import styled from 'styled-components';
import { ActiveContainer } from '@components/ActiveContainer';

export type DataBlockCOntainerSize = 'full' | 'half' | 'fourth' | 'dashboard';
export type DataBlockContainerProps = {
  size: DataBlockCOntainerSize;
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
`;
