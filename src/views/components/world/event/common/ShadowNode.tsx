import styled from 'styled-components';
import React from 'react';

type ShadowNodeProps = {
  id: string;
};

const ShadowNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 160px;
  background-color: black;
  border-radius: 16px;
  opacity: 0.5;
`;

export const ShadowNode = ({ id }: ShadowNodeProps) => {
  return <ShadowNodeContainer />;
};
