import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import path from 'path';
import { useTranslation } from 'react-i18next';
import { useConfigSceneTitle } from '@utils/useProjectConfig';
import { DashboardEditor } from '../DashboardEditor';
import { ReloadableImage } from '@components/ReloadableImage';
import { ClearButtonOnlyIcon } from '@components/buttons';
import { DropInput, DropInputContainer } from '@components/inputs/DropInput';
import { useImageSaving } from '@utils/useImageSaving';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';

type SplashScreenContainerProps = {
  splashScreenLength: number;
};

const SplashScreenContainer = styled.div<SplashScreenContainerProps>`
  display: flex;
  flex-direction: row;
  gap: 16px;
  overflow-x: auto;
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

  & :hover {
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
  onDrag: boolean;
  onSplashScreenClear: (index: number) => void;
};

const SplashScreenCard = React.forwardRef<HTMLInputElement, SplashScreenCardProps>(
  ({ index, splashScreenPath, provided, onDrag, onSplashScreenClear }, ref) => {
    return (
      <SplashScreenCardContainer
        ref={ref}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
        }}
        {...provided.dragHandleProps}
      >
        {onDrag ? <img src={splashScreenPath} draggable="false" /> : <ReloadableImage src={splashScreenPath} draggable="false" />}
        <button className="clear-button">
          <ClearButtonOnlyIcon onClick={() => onSplashScreenClear(index)} />
        </button>
      </SplashScreenCardContainer>
    );
  }
);
SplashScreenCard.displayName = 'SplashScreenCard';

export const DashboardGameStartSplashScreen = () => {
  const { t } = useTranslation('dashboard_game_start');
  const { projectConfigValues: gameStart, setProjectConfigValues: setGameStart, state } = useConfigSceneTitle();
  const { addImage, removeImage, getImage } = useImageSaving();
  const currentEditedGameStart = useMemo(() => gameStart.clone(), [gameStart]);
  const [onDrag, setOnDrag] = useState(false);

  const getSplashScreenPath = (filename: string) => {
    const filenameWithExt = filename + '.png';
    return getImage(path.join('graphics/titles', filenameWithExt)) ?? path.join(state.projectPath || '', 'graphics/titles', filenameWithExt);
  };

  const onSplashScreenClear = (index: number) => {
    removeImage(path.join('graphics/titles', currentEditedGameStart.additionalSplashes[index] + '.png'));
    currentEditedGameStart.additionalSplashes.splice(index, 1);
    setGameStart(currentEditedGameStart);
  };

  const onSplashScreenChoosen = (splashScreenPath: string) => {
    addImage(path.join('graphics/titles', path.basename(splashScreenPath)), splashScreenPath);
    currentEditedGameStart.additionalSplashes.push(path.basename(splashScreenPath, '.png'));
    setGameStart(currentEditedGameStart);
  };

  return (
    <DashboardEditor editorTitle={t('game_start')} title={t('splash_screens')}>
      {gameStart.additionalSplashes.length > 0 ? (
        <SplashScreenContainer splashScreenLength={gameStart.additionalSplashes.length}>
          <DragDropContext
            onDragStart={() => setOnDrag(true)}
            onDragEnd={(result: DropResult) => {
              setOnDrag(false);
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
                          splashScreenPath={getSplashScreenPath(filename)}
                          onSplashScreenClear={onSplashScreenClear}
                          provided={provided}
                          onDrag={onDrag}
                        />
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <DropInput name={t('splash_screens_name')} extensions={['png']} onFileChoosen={onSplashScreenChoosen} multipleFiles={true} />
        </SplashScreenContainer>
      ) : (
        <DropInput name={t('splash_screens_name')} extensions={['png']} onFileChoosen={onSplashScreenChoosen} multipleFiles={true} />
      )}
    </DashboardEditor>
  );
};
