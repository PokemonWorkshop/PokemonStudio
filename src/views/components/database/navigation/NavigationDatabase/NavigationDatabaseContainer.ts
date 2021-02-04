import styled from 'styled-components';

export const NavigationDatabaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1px 12px;
  margin-left: 2px;
  width: 192px;
  height: 1080px;
  left: 74px;
  top: 0px;
  background: ${(props) => props.theme.colors.dark16};
  border-radius: 2px;
`;
