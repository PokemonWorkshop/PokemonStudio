import React, { useState } from 'react';
import styled from 'styled-components';
import { ClearInput } from '@components/inputs';
import { CommandLibraryCategories } from './CommandLibraryCategories';
import { CommandLibraryBlock } from './CommandLibraryBlock';
import { useTranslation } from 'react-i18next';
import { EditorContainer } from '@components/editor/EditorContainer';
import { STUDIO_EVENT_COMMAND_CATEGORY_LIST, StudioEventCommandCategory } from '@root/src/models/entities/event/category';

const CommandLibraryContainer = styled(EditorContainer)`
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

  .categories,
  .commands {
    overflow-y: auto;

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      margin-bottom: 3px;
      margin-top: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.dark12};
      opacity: 0.8;
      box-sizing: border-box;
      border: 1px solid ${({ theme }) => theme.colors.text500};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: ${({ theme }) => theme.colors.dark15};
      border-color: ${({ theme }) => theme.colors.text400};
    }
  }

  .categories {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 4px;
  }
`;

export const CommandLibrary = () => {
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<StudioEventCommandCategory | undefined>(undefined);
  const [research, setResearch] = useState<string>('');
  const { t } = useTranslation();

  const onClear = () => {
    setSelectedCommandCategory(undefined);
    setResearch('');
  };

  return (
    <CommandLibraryContainer>
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
      <div className="categories">
        {research ? (
          <>
            {STUDIO_EVENT_COMMAND_CATEGORY_LIST.map((category) => (
              <CommandLibraryBlock key={category} category={category} research={research} setSelectedCommandCategory={setSelectedCommandCategory} />
            ))}
          </>
        ) : selectedCommandCategory ? (
          <CommandLibraryBlock category={selectedCommandCategory} setSelectedCommandCategory={setSelectedCommandCategory} />
        ) : (
          <CommandLibraryCategories setSelectedCommandCategory={setSelectedCommandCategory} />
        )}
      </div>
    </CommandLibraryContainer>
  );
};
