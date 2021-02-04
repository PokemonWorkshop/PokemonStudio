import styled from 'styled-components';

export const NavigationDatabaseItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px 16px;
  width: 160px;
  border-radius: 8px;
  text-decoration: none;
  color: ${(props) => props.theme.colors.text400};
  margin-top: 4px;

  &:hover {
    background-color: ${(props) => props.theme.colors.dark18};
  }
`;
