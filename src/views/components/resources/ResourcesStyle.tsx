import styled from 'styled-components';

export const ResourcesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1024px;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    padding: 0 calc(50% - ${({ theme }) => theme.sizes.half.max}px / 2);
  }
`;

type ResourceContainerProps = {
  disabled: boolean;
};

export const ResourceContainer = styled.div<ResourceContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  box-sizing: border-box;
  user-select: none;

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.dark24};
    background-color: ${({ theme }) => theme.colors.dark14};

    & button {
      display: inline-block;
      height: 40px;
      width: 40px;
      background: none;
      color: inherit;
      border: none;
      font: inherit;
      outline: inherit;
      padding: 0px;
    }
  }

  & img {
    object-fit: cover;
    image-rendering: pixelated;
  }

  & span.title {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  & button {
    display: none;
  }
`;

const sizeRecord: Record<'full' | 'half' | 'third' | 'fourth', { default: string; breakpoint: string }> = {
  full: {
    default: '1fr',
    breakpoint: '1fr',
  },
  half: {
    default: '1fr 1fr',
    breakpoint: '1fr',
  },
  third: {
    default: '1fr 1fr 1fr',
    breakpoint: '1fr',
  },
  fourth: {
    default: '1fr 1fr 1fr 1fr',
    breakpoint: '1fr 1fr',
  },
};

type ResourceWrapperProps = {
  size: 'full' | 'half' | 'third' | 'fourth';
};

export const ResourceWrapper = styled.div<ResourceWrapperProps>`
  display: grid;
  gap: 16px;
  grid-template-columns: ${({ size }) => sizeRecord[size].default};
  justify-content: left;
  min-width: 1024px;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    min-width: 504px;
    grid-template-columns: ${({ size }) => sizeRecord[size].breakpoint};
  }
`;
