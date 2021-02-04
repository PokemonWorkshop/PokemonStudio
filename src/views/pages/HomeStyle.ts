import styled from 'styled-components';

const HomeStyle = styled.div`
  display: flex;
  padding: 0 80px;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;

  #main {
    display: flex;
    width: 70%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;

    #appName span {
      font-size: 25px;
    }

    #buttons {
      display: flex;
    }

    #recentProjects {
      display: flex;
      flex-direction: column;
      width: 100%;

      #recentProjectsRow {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  }
`;

export default HomeStyle;
