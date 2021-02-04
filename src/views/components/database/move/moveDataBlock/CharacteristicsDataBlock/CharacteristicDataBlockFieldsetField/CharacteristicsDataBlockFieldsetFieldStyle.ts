import styled from 'styled-components';

export const CharacteristicsDataBlockFieldsetFieldStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 8px;
  background: ${(props) => props.theme.colors.dark18};
  border-radius: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 19px;
  color: ${(props) => props.theme.colors.text100};
`;
