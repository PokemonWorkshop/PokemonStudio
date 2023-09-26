import styled from 'styled-components';
import { ResourceContainer } from './ResourcesStyle';
import { DropInputContainer } from '@components/inputs/DropInput';

export type SpriteResourceType = 'character' | 'creature' | 'battleSprite' | 'artwork';

const size = {
  container: {
    // height
    battleSprite: '238px',
    character: '244px',
    creature: '270px',
    artwork: '238px',
  },
  image: {
    battleSprite: {
      height: '160px',
      width: '160px',
    },
    character: {
      height: '128px',
      width: '128px',
    },
    creature: {
      height: '192px',
      width: '192px',
    },
    artwork: {
      width: '256px',
      height: '128px',
    },
  },
  dragDrop: {
    // height
    battleSprite: '174px',
    character: '174px',
    creature: '192px',
    artwork: '174px',
  },
  gap: {
    battleSprite: '16px',
    character: '16px',
    creature: '24px',
    artwork: '16px',
  },
};

type SpriteResourceContainerProps = {
  type: SpriteResourceType;
};

export const SpriteResourceContainer = styled(ResourceContainer)<SpriteResourceContainerProps>`
  position: relative;
  flex-direction: column;
  padding: 24px 24px 16px;
  height: ${({ type }) => size.container[type]};

  &:hover {
    padding: 23px 23px 15px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    & button {
      position: absolute;
    }

    & button.clear-button {
      top: 6px;
      right: 6px;
    }

    & button.folder-button {
      top: 6px;
      right: 50px;
    }
  }

  & img {
    height: ${({ type }) => size.image[type].height};
    width: ${({ type }) => size.image[type].width};
  }

  & span.title {
    width: 100%;
  }

  & div.image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 160px;
    min-height: 160px;
  }
`;

type SpriteNoResourceContainerProps = SpriteResourceContainerProps;

export const SpriteNoResourceContainer = styled(DropInputContainer)<SpriteNoResourceContainerProps>`
  display: flex;
  padding: 24px 24px 16px;
  height: ${({ type }) => size.container[type]};
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;
  gap: ${({ type }) => size.gap[type]};

  & .drag-and-drop {
    display: flex;
    gap: 8px;
    height: ${({ type }) => size.dragDrop[type]};
    justify-content: center;
  }

  & span.title {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    letter-spacing: 1.5px;
    text-transform: uppercase;
    width: 100%;
  }
`;

type LinkContainerProps = {
  disabled: boolean;
};

export const LinkContainer = styled.div<LinkContainerProps>`
  color: ${({ theme, disabled }) => (disabled ? theme.colors.text500 : theme.colors.primaryBase)};
  text-align: center;

  :hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;
