import styled from 'styled-components';

export const DataBlockWrapperWithNoBreakpoint = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 16px;
  margin: 0 -8px;
  justify-content: center;
`;

export const DataBlockWrapper = styled(DataBlockWrapperWithNoBreakpoint)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    padding: 0 calc(50% - ${({ theme }) => theme.sizes.half.max}px / 2);
  }
`;
