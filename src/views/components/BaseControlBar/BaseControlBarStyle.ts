import styled from 'styled-components';

export const BaseControlBarStyle = styled.div`
  width: -webkit-fill-available;
  display: flex;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
  margin-left: 2px;
  min-height: 64px;
  background-color: ${(props) => props.theme.colors.dark16};
`;
