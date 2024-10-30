import { CompilationLogs } from '@components/compilation/CompilationLogs';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const CompilationPageContainer = styled.div`
  padding: 24px 20px 24px 20px;
  background-color: ${({ theme }) => theme.colors.dark16};
`;

export const CompilationPage = () => {
  const { state } = useLocation();

  return (
    <CompilationPageContainer>
      <CompilationLogs configuration={state.configuration} />
    </CompilationPageContainer>
  );
};
