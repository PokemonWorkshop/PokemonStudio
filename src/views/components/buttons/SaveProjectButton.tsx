import styled from 'styled-components';
import React, { useEffect, useMemo, useState } from 'react';
import theme from '@src/AppTheme';
import { useProjectSaving } from '@utils/useProjectSaving';
import { BaseIcon } from '@components/icons/BaseIcon';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

import { BaseButtonStyle } from './GenericButtons';

const SaveProjectButtonContainer = styled(BaseButtonStyle)`
  display: inline-block;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-bottom: 4px; /* remove this when a gap will used in navigation bar */
  padding: 14px 6px 6px 14px;

  &[data-disabled] {
    background-color: ${theme.colors.dark16};
  }

  &:hover {
    background-color: ${theme.colors.dark18};
  }

  &:active > ${SvgContainer} {
    background-color: ${theme.colors.primarySoft};

    svg {
      color: ${theme.colors.primaryBase};
    }
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

type BadgeProps = {
  visible: boolean;
};

const Badge = styled.div<BadgeProps>`
  ${({ visible }) => !visible && 'display: none;'}
  border-radius: 100%;
  background-color: ${theme.colors.dangerBase};
  width: 8px;
  height: 8px;
`;

export const SaveProjectButton = () => {
  const { state, setState, saveProject, isDataToSave, isProjectTextSave } = useProjectSaving();

  const handleClick = useMemo(
    () => async () => saveProject(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isProjectTextSave, state.savingData.map.size, state.savingConfig.map.size, state.savingProjectStudio, state.tmpHackHasTextToSave, state]
  );

  const [projectLoaded, setProjectLoaded] = useState(false);

  useEffect(() => {
    if (!projectLoaded) {
      setProjectLoaded(true);
    } else {
      const newProjectData = Object.assign({}, state.projectData);
      Object.keys(newProjectData).forEach((key) =>
        Object.keys(newProjectData[key]).forEach(
          (id) =>
            (newProjectData[key][id].projectText = {
              texts: newProjectData[key][id].projectText!.texts,
              config: state.projectConfig.language_config,
            })
        )
      );
      setState(Object.assign({ projectData: newProjectData }, state));
    }
  }, [state.projectConfig.language_config]);

  return (
    <SaveProjectButtonContainer onClick={handleClick} disabled={!isDataToSave}>
      <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="save" disabled={!isDataToSave} />
      <BadgeContainer>
        <Badge visible={isDataToSave} />
      </BadgeContainer>
    </SaveProjectButtonContainer>
  );
};
