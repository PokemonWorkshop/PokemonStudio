import { PrimaryButton } from '@components/buttons';
import { Input, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';

import { SelectMap } from '@components/selects';
import { useEventConvert } from '@hooks/useEventConvert.ts';
import { useProjectMaps } from '@src/hooks/useProjectData';
import React, { useRef, useState } from 'react';
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
  const { projectDataValues: maps, state } = useProjectMaps();
  const projectPath = state.projectPath!;
  const [mapDbSymbol, setMapDbSymbol] = useState('map001');
  const [result, setResult] = useState('');
  const map = maps[mapDbSymbol];
  const eventIdRef = useRef<HTMLInputElement>(null);
  const eventConvert = useEventConvert();

  const getEventIds = () => {
    if (eventIdRef.current?.valueAsNumber === undefined) return undefined;
    return Number.isNaN(eventIdRef.current?.valueAsNumber) ? undefined : [eventIdRef.current?.valueAsNumber];
  };

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
        If empty, all events of the map are read
        <PrimaryButton
          onClick={() =>
            window.api.readRMXPEvents(
              { projectPath, mapId: map.id, eventIds: getEventIds() },
              ({ rmxpEvents }) => {
                console.log(rmxpEvents);
                setResult(`Success! (Map id: ${map.id})`);
              },
              ({ errorMessage }) => {
                console.error(errorMessage);
                setResult(`Error! (Map id: ${map.id}) Read the console log`);
              },
            )
          }
        >
          Read event(s)
        </PrimaryButton>
        <PrimaryButton
          onClick={() =>
            eventConvert(
              { mapId: map.id, eventIds: getEventIds() },
              () => setResult(`Success! (Map id: ${map.id})`),
              (errorMessage) => {
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
      Result available in the console
    </ConvertEventsPageContainer>
  );
};
