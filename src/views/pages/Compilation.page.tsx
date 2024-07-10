import { CompilationLogs } from '@components/compilation/CompilationLogs';
import React from 'react';
import styled from 'styled-components';

const CompilationPageContainer = styled.div`
  padding: 24px 20px 24px 20px;
  background-color: ${({ theme }) => theme.colors.dark16};
`;

export const CompilationPage = () => {
  return (
    <CompilationPageContainer>
      <CompilationLogs />
    </CompilationPageContainer>
  );
};
