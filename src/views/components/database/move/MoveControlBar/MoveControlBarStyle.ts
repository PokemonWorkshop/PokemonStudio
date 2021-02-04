import styled from 'styled-components';

export const MoveControlBarStyle = styled.div`
  width: -webkit-fill-available;
  display: flex;
  margin-left: 2px;
  min-height: 64px;
  background-color: ${(props) => props.theme.colors.dark16};
`;
