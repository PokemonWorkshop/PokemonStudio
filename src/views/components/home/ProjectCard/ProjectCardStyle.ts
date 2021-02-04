import styled from 'styled-components';

const ProjectCardStyle = styled.div`
  box-sizing: border-box;
  margin-right: 10px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.mediumGrey};
  display: flex;
  flex-direction: column;
  padding: 10px 5px 5px 10px;
  width: 200px;
  height: 150px;

  .projectTitle {
    margin: auto 0 auto 0;
  }

  .projectPSDKVersion {
    margin-top: auto;
    align-self: flex-end;
  }
`;

export default ProjectCardStyle;
