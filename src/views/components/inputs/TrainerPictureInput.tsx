import React from 'react';
import styled from 'styled-components';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { ResourceImage } from '@components/ResourceImage';

type TrainerPictureInputContainerProps = {
  pixelated: boolean;
};

const TrainerPictureInputContainer = styled.div<TrainerPictureInputContainerProps>`
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

  &:hover {
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

type TrainerPictureInputProps = {
  picturePath: string;
  name: string;
  pixelated?: boolean;
  onIconClear: () => void;
};

export const TrainerPictureInput = ({ picturePath, pixelated, onIconClear }: TrainerPictureInputProps) => {
  return (
    <TrainerPictureInputContainer pixelated={pixelated || false}>
      <div className="picture">
        <ResourceImage imagePathInProject={picturePath} />
        <div className="clear-button">
          <ClearButtonOnlyIcon onClick={onIconClear} />
        </div>
      </div>
    </TrainerPictureInputContainer>
  );
};
