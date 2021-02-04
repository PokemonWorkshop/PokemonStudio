import styled from 'styled-components';

const FooterStyle = styled.div`
  width: 100%;
  display: flex;
  flex-basis: 120px;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;

    &#left {
      justify-content: flex-start;
      flex-wrap: wrap;
      flex-basis: 50%;
      a {
        margin-right: 20px;
      }
    }

    &#right {
      justify-content: flex-end;
      flex-basis: 50%;

      #brand {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
`;

export default FooterStyle;
