import styled from 'styled-components';

export const MapLinkCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 256px;
  height: 160px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.dark16};
  align-items: center;
  justify-content: center;
  cursor: default;

  &[data-type='link'] {
    justify-content: space-between;
  }
`;

export const MapLinkTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  &[data-type='link'] {
    padding-top: 24px;
  }

  & span.map-name {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    color: ${({ theme }) => theme.colors.text100};
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & span.map-name-error {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & span.map-id {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
  }
`;

export const MapLinkCardWithClearButtonContainer = styled(MapLinkCardContainer)`
  position: relative;

  & button.clear-button {
    display: none;
  }

  & :hover {
    & button.clear-button {
      position: absolute;
      display: inline-block;
      top: 2px;
      right: 1px;
      height: 50px;
      width: 52px;
      background: none;
      color: inherit;
      border: none;
      font: inherit;
      cursor: pointer;
      outline: inherit;
    }
  }
`;
