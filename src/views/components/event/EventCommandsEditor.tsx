import React, { useState } from 'react';
import styled from 'styled-components';
import { ClearInput } from '../inputs';
import { EventCommandCategories } from './EventCommandCategories';
import { EventCommands } from './EventCommands';
import { useTranslation } from 'react-i18next';
import { EditorContainer } from '../editor/EditorContainer';
import { STUDIO_EVENT_COMMAND_CATEGORY_LIST, StudioEventCommandCategory } from '@modelEntities/event';

const EventCommandsEditorContainer = styled(EditorContainer)`
  position: unset;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 240px;
  height: 100%;
  background-color: rgb(23, 24, 26);
  border-left: 1px solid rgb(46, 48, 54);
  overflow: unset;
  padding: 0;
  user-select: none;

  .head {
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 8px;

    .title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 24px;

      h2 {
        margin: 0;
        color: ${({ theme }) => theme.colors.text100} !important;
      }
    }
  }

  .commands {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 8px;
    padding: 8px 12px 8px 12px;
  }
`;

export const EventCommandsEditor = () => {
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<StudioEventCommandCategory | undefined>(undefined);
  const [research, setResearch] = useState<string>('');
  const { t } = useTranslation();

  const onClear = () => {
    setSelectedCommandCategory(undefined);
    setResearch('');
  };

  return (
    <EventCommandsEditorContainer>
      <div className="head">
        <div className="title">
          <h2>{t('instructions')}</h2>
          {/*<span>Icon</span>*/}
        </div>
        <ClearInput
          value={research}
          onChange={(event) => setResearch(event.target.value.toLowerCase())}
          onClear={onClear}
          placeholder={t('search')}
        />
      </div>
      {research ? (
        <>
          {STUDIO_EVENT_COMMAND_CATEGORY_LIST.map((category) => (
            <EventCommands key={category} category={category} research={research} setSelectedCommandCategory={setSelectedCommandCategory} />
          ))}
        </>
      ) : selectedCommandCategory ? (
        <EventCommands category={selectedCommandCategory} setSelectedCommandCategory={setSelectedCommandCategory} />
      ) : (
        <div className="commands">
          <EventCommandCategories setSelectedCommandCategory={setSelectedCommandCategory} />
        </div>
      )}
    </EventCommandsEditorContainer>
  );
};
