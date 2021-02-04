import React, { FunctionComponent } from 'react';
import ProjectCardProps from './ProjectCardProps';
import ProjectCardStyle from './ProjectCardStyle';
import { BaseIcon } from '../../icons/BaseIcon';

const ProjectCard: FunctionComponent<ProjectCardProps> = (
  props: ProjectCardProps
) => {
  const { projectId } = props;
  return (
    <ProjectCardStyle>
      <BaseIcon icon="top" size="m" color="" />
      <div className="projectTitle">{`project ${projectId}`}</div>
      <div className="projectPSDKVersion">PSDK 0.01</div>
    </ProjectCardStyle>
  );
};

export { ProjectCard };
