import styled from 'styled-components';
import React from 'react';

type ShadowNodeProps = {
  id: string;
};

const ShadowNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 240px;
  background-color: black;
  border-radius: 8px;
`;

export const ShadowNode = ({ id }: ShadowNodeProps) => {
  return <ShadowNodeContainer />;
};
