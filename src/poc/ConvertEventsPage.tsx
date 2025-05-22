import { PrimaryButton } from '@components/buttons';
import { SelectMap } from '@components/selects';
import { useProjectData } from '@src/hooks/useProjectData';
import React, { useState } from 'react';

export const ConvertEventsPage = () => {
  const { projectDataValues: maps, state } = useProjectData('maps', 'map');
  const projectPath = state.projectPath!;
  const [mapDbSymbol, setMapDbSymbol] = useState('map001');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SelectMap dbSymbol={mapDbSymbol} onChange={(dbSymbol) => setMapDbSymbol(dbSymbol)} />
        <PrimaryButton
          onClick={() =>
            window.api.convertRMXPEventsToStudioEvents(
              { events: [], map: JSON.stringify(maps[mapDbSymbol]), projectPath },
              () => console.log('success!'),
              ({ errorMessage }) => console.error(errorMessage)
            )
          }
        >
          Convert events
        </PrimaryButton>
      </div>
      Read the backend log to read the result
    </div>
  );
};
