import { PrimaryButton } from '@components/buttons';
import { SelectMap } from '@components/selects';
import { useProjectData } from '@src/hooks/useProjectData';
import React, { useState } from 'react';

export const ConvertEventsPage = () => {
  const { projectDataValues: maps, state } = useProjectData('maps', 'map');
  const projectPath = state.projectPath!;
  const [mapDbSymbol, setMapDbSymbol] = useState('map001');
  const [result, setResult] = useState('');
  const map = maps[mapDbSymbol];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <SelectMap dbSymbol={mapDbSymbol} onChange={(dbSymbol) => setMapDbSymbol(dbSymbol)} />
        <PrimaryButton
          onClick={() =>
            window.api.convertRMXPEventsToStudioEvents(
              { events: [], map: JSON.stringify(map), projectPath },
              () => setResult(`Success! (Map id: ${map.id})`),
              ({ errorMessage }) => {
                console.error(errorMessage);
                setResult(`Error! (Map id: ${map.id}) Read the console log`);
              }
            )
          }
        >
          Convert events
        </PrimaryButton>
        <span>{result}</span>
      </div>
      Read the backend log to read the result
    </div>
  );
};
