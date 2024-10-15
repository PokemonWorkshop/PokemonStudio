import React, { useMemo, forwardRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { basename } from '@utils/path';
import { useConfigSceneTitle } from '@hooks/useProjectConfig';
import { PageEditor } from '@components/pages';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { DropInput, DropInputContainer } from '@components/inputs/DropInput';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from '@hello-pangea/dnd';
import { cloneEntity } from '@utils/cloneEntity';
import { ResourceImage } from '@components/ResourceImage';

type SplashScreenContainerProps = {
  splashScreenLength: number;
};

const SplashScreenContainer = styled.div<SplashScreenContainerProps>`
  display: flex;
  flex-direction: row;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  height: ${({ splashScreenLength }) => (splashScreenLength >= 4 ? '165px' : 'auto')};

  ${DropInputContainer} {
    min-width: 153px;
    width: 153px;
    height: 153px;
    padding: 16px 16px;
  }

  & div.drag-container {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    height: ${({ splashScreenLength }) => (splashScreenLength >= 2 ? '165px' : 'auto')};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin-bottom: 4px;
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
`;

const SplashScreenCardContainer = styled.div`
  position: relative;
  width: 153px;
  height: 153px;
  border-radius: 8px;

  & img {
    width: 153px;
    height: 153px;
    border-radius: 8px;
    object-fit: cover;
  }

  &:hover {
    cursor: grab;

    & button.clear-button {
      position: absolute;
      display: inline-block;
      top: 3px;
      right: -2px;
      height: 40px;
      width: 52px;
      background: none;
      color: inherit;
      border: none;
      font: inherit;
      outline: inherit;
      cursor: grab;
    }
  }

  & button.clear-button {
    display: none;
  }
`;

type SplashScreenCardProps = {
  index: number;
  splashScreenPath: string;
  provided: DraggableProvided;
  onSplashScreenClear: (index: number) => void;
};

const SplashScreenCard = forwardRef<HTMLInputElement, SplashScreenCardProps>(({ index, splashScreenPath, provided, onSplashScreenClear }, ref) => {
  return (
    <SplashScreenCardContainer
      ref={ref}
      {...provided.draggableProps}
      style={{
        ...provided.draggableProps.style,
      }}
      {...provided.dragHandleProps}
    >
      <ResourceImage imagePathInProject={splashScreenPath} />
      <button className="clear-button">
        <ClearButtonOnlyIcon onClick={() => onSplashScreenClear(index)} />
      </button>
    </SplashScreenCardContainer>
  );
});
SplashScreenCard.displayName = 'SplashScreenCard';

export const DashboardGameStartSplashScreen = () => {
  const { t } = useTranslation('dashboard_game_start');
  const { projectConfigValues: gameStart, setProjectConfigValues: setGameStart } = useConfigSceneTitle();
  const currentEditedGameStart = useMemo(() => cloneEntity(gameStart), [gameStart]);

  const onSplashScreenClear = (index: number) => {
    currentEditedGameStart.additionalSplashes.splice(index, 1);
    setGameStart(currentEditedGameStart);
  };

  const onSplashScreenChoosen = (splashScreenPath: string) => {
    currentEditedGameStart.additionalSplashes.push(basename(splashScreenPath, '.png'));
    setGameStart(currentEditedGameStart);
  };

  return (
    <PageEditor editorTitle={t('game_start')} title={t('splash_screens')}>
      {gameStart.additionalSplashes.length > 0 ? (
        <SplashScreenContainer splashScreenLength={gameStart.additionalSplashes.length}>
          <DragDropContext
            onDragEnd={(result: DropResult) => {
              const srcI = result.source.index;
              const desI = result.destination?.index;
              if (desI === undefined) return;

              currentEditedGameStart.additionalSplashes.splice(desI, 0, currentEditedGameStart.additionalSplashes.splice(srcI, 1)[0]);
              setGameStart(currentEditedGameStart);
            }}
          >
            <Droppable droppableId="droppable-additional-splash" direction="horizontal">
              {(droppableProvided: DroppableProvided) => (
                <div ref={droppableProvided.innerRef} className="drag-container" {...droppableProvided.droppableProps}>
                  {gameStart.additionalSplashes.map((filename, index) => (
                    <Draggable key={`splash-screen-${index}`} draggableId={`draggable-additional-splash-${index}`} index={index}>
                      {(provided: DraggableProvided) => (
                        <SplashScreenCard
                          ref={provided.innerRef}
                          index={index}
                          splashScreenPath={`graphics/titles/${filename}.png`}
                          onSplashScreenClear={onSplashScreenClear}
                          provided={provided}
                        />
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <DropInput
            destFolderToCopy="graphics/titles"
            name={t('splash_screens_name')}
            extensions={['png']}
            onFileChoosen={onSplashScreenChoosen}
            multipleFiles={true}
          />
        </SplashScreenContainer>
      ) : (
        <DropInput
          destFolderToCopy="graphics/titles"
          name={t('splash_screens_name')}
          extensions={['png']}
          onFileChoosen={onSplashScreenChoosen}
          multipleFiles={true}
        />
      )}
    </PageEditor>
  );
};
