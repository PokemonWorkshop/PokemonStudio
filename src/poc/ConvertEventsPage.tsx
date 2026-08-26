import { PrimaryButton } from '@components/buttons';
import { Input, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';

import { SelectMap } from '@components/selects';
import { useProjectData, useProjectEvents } from '@src/hooks/useProjectData';
import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const ConvertEventsPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  margin-left: 2px;
  background-color: ${({ theme }) => theme.colors.dark16};
  width: 100%;
  ${({ theme }) => theme.fonts.normalRegular}

  ${InputFormContainer} {
    width: 290px;
  }
`;

export const ConvertEventsPage = () => {
  const { projectDataValues: maps, state } = useProjectData('maps', 'map');
  const { projectDataValues: allEvents } = useProjectEvents();
  const projectPath = state.projectPath!;
  const [mapDbSymbol, setMapDbSymbol] = useState('map001');
  const [result, setResult] = useState('');
  const events = useMemo(() => Object.values(allEvents), [allEvents]);
  const map = maps[mapDbSymbol];
  const eventIdRef = useRef<HTMLInputElement>(null);

  // TODO: don't forget to create the new csv
  // const setNewProjectText = useNewProjectText();
  // setNewProjectText(event.csvFileId);

  return (
    <ConvertEventsPageContainer>
      <InputFormContainer>
        <SelectMap dbSymbol={mapDbSymbol} onChange={(dbSymbol) => setMapDbSymbol(dbSymbol)} />
        <InputWithLeftLabelContainer>
          <Label>RMXP event ID</Label>
          <Input type="number" ref={eventIdRef} min="0" step="1" />
        </InputWithLeftLabelContainer>
        If empty, all events of the map are returned
        <PrimaryButton
          onClick={() =>
            window.api.convertRMXPEventsToStudioEvents(
              { events: JSON.stringify(events), map: JSON.stringify(map), projectPath, eventId: eventIdRef.current?.valueAsNumber },
              () => setResult(`Success! (Map id: ${map.id})`),
              ({ errorMessage }) => {
                console.error(errorMessage);
                setResult(`Error! (Map id: ${map.id}) Read the console log`);
              },
            )
          }
        >
          Convert event(s)
        </PrimaryButton>
        <span>{result}</span>
      </InputFormContainer>
      Read the backend log to read the result
    </ConvertEventsPageContainer>
  );
};
