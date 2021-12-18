import styled from 'styled-components';

type DataSpriteContainerProps = {
  type: 'icon' | 'sprite';
};

export const DataSpriteContainer = styled.div<DataSpriteContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    width: ${({ type }) => (type === 'icon' ? '64' : '192')}px;
    height: auto;
    image-rendering: pixelated;
  }
`;
