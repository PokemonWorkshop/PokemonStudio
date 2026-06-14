import { PrimaryButton } from '@components/buttons';
import { SelectMap } from '@components/selects';
import { useProjectData, useProjectEvents } from '@src/hooks/useProjectData';
import React, { useMemo, useState } from 'react';

export const ConvertEventsPage = () => {
  const { projectDataValues: maps, state } = useProjectData('maps', 'map');
  const { projectDataValues: allEvents } = useProjectEvents();
  const projectPath = state.projectPath!;
  const [mapDbSymbol, setMapDbSymbol] = useState('map001');
  const [result, setResult] = useState('');
  const events = useMemo(() => Object.values(allEvents), [allEvents]);
  const map = maps[mapDbSymbol];

  // TODO: don't forget to create the new csv
  // const setNewProjectText = useNewProjectText();
  // setNewProjectText(event.csvFileId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <SelectMap dbSymbol={mapDbSymbol} onChange={(dbSymbol) => setMapDbSymbol(dbSymbol)} />
        <PrimaryButton
          onClick={() =>
            window.api.convertRMXPEventsToStudioEvents(
              { events, map: JSON.stringify(map), projectPath },
              () => setResult(`Success! (Map id: ${map.id})`),
              ({ errorMessage }) => {
                console.error(errorMessage);
                setResult(`Error! (Map id: ${map.id}) Read the console log`);
              },
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
