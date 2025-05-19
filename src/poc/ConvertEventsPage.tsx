import { PrimaryButton } from '@components/buttons';
import { useGlobalState } from '@src/GlobalStateProvider';
import React from 'react';

export const ConvertEventsPage = () => {
  const [state] = useGlobalState();
  const map = state.projectData.maps['map005'];
  const projectPath = state.projectPath!;

  return (
    <div style={{ padding: '24px' }}>
      <PrimaryButton
        onClick={() =>
          window.api.convertRMXPEventsToStudioEvents(
            { events: [], map: JSON.stringify(map), projectPath },
            () => console.log('success!'),
            ({ errorMessage }) => console.error(errorMessage)
          )
        }
      >
        Convert
      </PrimaryButton>
    </div>
  );
};
