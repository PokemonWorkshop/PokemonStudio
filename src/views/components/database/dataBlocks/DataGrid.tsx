import styled from 'styled-components';

type DataGridProps = {
  columns?: string;
  rows?: string;
  flow?: 'row' | 'column';
  gap?: string;
  rowGap?: string;
};

export const DataGrid = styled.div<DataGridProps>`
  display: grid;
  ${({ columns }) => columns && `grid-template-columns: ${columns};`}
  ${({ rows }) => rows && `grid-template-rows: ${rows};`}
  grid-auto-flow: ${({ flow }) => flow || 'column'};
  gap: ${({ gap }) => gap || '16px'};
`;
