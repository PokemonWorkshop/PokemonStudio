import { DarkButton, SecondaryButton } from '@components/buttons';
import styled from 'styled-components';

export const DashboardGameOptionsTableContainer = styled.div`
  display: flex;
  flex-direction: column;

  .empty-list {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }
`;

type RenderOptionContainerProps = {
  isDragging?: boolean;
  dragOn?: boolean;
};

export const RenderOptionContainer = styled.div.attrs<RenderOptionContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderOptionContainerProps>`
  display: flex;
  box-sizing: border-box;
  padding: 4px 4px 4px 8px;
  gap: 48px;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  border-radius: 8px;
  margin-left: -8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};

    ${SecondaryButton},
    ${DarkButton} {
      visibility: ${({ dragOn }) => (dragOn ? `hidden` : 'visible')};
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text500};

    :hover {
      cursor: grab;
    }
  }

  .icon-name {
    display: flex;
    gap: 16px;
  }

  .name {
    color: ${({ theme }) => theme.colors.text100};
    ${({ theme }) => theme.fonts.normalMedium}
  }

  ${SecondaryButton},
  ${DarkButton} {
    visibility: hidden;
    height: 32px;
  }

  &[data-dragged] {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }
`;
