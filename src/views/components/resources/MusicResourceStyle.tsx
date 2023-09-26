import styled from 'styled-components';
import { ResourceContainer } from './ResourcesStyle';

export const MusicResourceContainer = styled(ResourceContainer)`
  flex-direction: row;
  padding: 16px 16px 16px 24px;
  height: 80px;

  .svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text400};
    background-color: ${({ theme }) => theme.colors.dark18};
  }

  &:hover {
    padding: 15px 15px 15px 23px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }

  & img {
    height: 32px;
    width: 32px;
    object-position: 0 100%;
  }

  & div.icon-title {
    display: flex;
    gap: 16px;
    ${({ theme }) => theme.fonts.normalMedium}
  }

  & div.buttons {
    display: flex;
    gap: 4px;
  }

  & span.title {
    display: flex;
    align-items: center;
  }

  & div.music-name {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export const MusicNoResourceContainer = styled(MusicResourceContainer)`
  display: flex;
  border: 1px dashed ${({ theme }) => theme.colors.dark20};
  background-color: inherit;

  .no-music-svg-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
  }

  :hover {
    background-color: inherit;
    border: 1px dashed ${({ theme }) => theme.colors.dark20};
    padding: 16px 16px 16px 24px;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;
