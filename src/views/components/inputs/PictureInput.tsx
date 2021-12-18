import React from 'react';
import styled from 'styled-components';
import { ClearButtonOnlyIcon } from '@components/buttons';

type PictureInputContainerProps = {
  pixelated: boolean;
};

const PictureInputContainer = styled.div<PictureInputContainerProps>`
  position: relative;
  display: inline-block;
  height: 160px;
  background-color: ${({ theme }) => theme.colors.dark12};
  border-radius: 4px;
  user-select: none;

  & .picture {
    display: inline-block;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    & img {
      object-fit: cover;
      image-rendering: ${({ pixelated }) => (pixelated ? 'pixelated' : 'auto')};
      width: 100%;
      height: 100%;
    }
  }

  & :hover {
    .clear-button {
      position: absolute;
      display: inline-block;
      top: 16px;
      right: 16px;
    }
  }

  .clear-button {
    display: none;
  }
`;

type PictureInputProps = {
  picturePath: string;
  name: string;
  pixelated?: boolean;
  onIconClear: () => void;
};

export const PictureInput = ({ picturePath, pixelated, onIconClear }: PictureInputProps) => {
  return (
    <PictureInputContainer pixelated={pixelated || false}>
      <div className="picture">
        <img src={picturePath} draggable="false" />
        <div className="clear-button">
          <ClearButtonOnlyIcon onClick={onIconClear} />
        </div>
      </div>
    </PictureInputContainer>
  );
};
