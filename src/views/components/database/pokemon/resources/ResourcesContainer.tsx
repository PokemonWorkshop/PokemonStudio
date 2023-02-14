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
  margin: 0 8px 0 8px;
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
