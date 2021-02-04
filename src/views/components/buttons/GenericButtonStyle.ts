import styled from 'styled-components';

const GenericButtonStyle = styled.a`
  display: flex;
  margin-right: 10px;
  padding: 10px 30px;
  background-color: #2d2c35;
  border-radius: 8px;

  &:visited {
    text-decoration: none;
  }

  &:hover {
    cursor: pointer;
  }

  div {
    margin-right: 10px;
  }
`;

export default GenericButtonStyle;
