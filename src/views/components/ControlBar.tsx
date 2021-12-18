import styled from 'styled-components';
import { SecondaryButton } from './buttons';

export const ControlBar = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 37%) auto;
  align-items: center;
  box-sizing: border-box;
  padding: 12px;
  margin-left: 2px;
  height: 64px;
  gap: 12px;
  background-color: ${(props) => props.theme.colors.dark16};
  border-radius: 2px;

  & > ${SecondaryButton} {
    width: max-content;
  }
`;

export const ControlBarButtonContainer = styled.div`
  display: flex;
  gap: 32px;
  width: max-content;
`;

export const ControlBarLabelContainer = styled.div`
  display: flex;
  gap: 12px;
  width: max-content;
`;
