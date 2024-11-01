import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardGameOptions } from './useDashboardGameOptions';
import { DashboardGameOptionsTableContainer, RenderOptionContainer } from './DashboardGameOptionsStyle';
import { DarkButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';
import { DEFAULT_GAME_OPTIONS, DefaultGameOptions } from '@modelEntities/config';
import { DragDropContext, Draggable, DraggableProvided, DraggableStateSnapshot, DropResult, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';

type RenderOptionActiveProps = {
  index: number;
  option: string;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
  disabledDisableOption: boolean;
  disableOption: (option: string) => void;
};

const RenderOptionActive = forwardRef<HTMLDivElement, RenderOptionActiveProps>(
  ({ index, option, provided, isDragging, dragOn, disabledDisableOption, disableOption }, ref) => {
    const { t, i18n } = useTranslation('dashboard_game_options');
    const disabledLanguage = option === 'language';
    const isOptionUnknown = !(DEFAULT_GAME_OPTIONS as readonly string[]).includes(option);

    const gameOptionName = (option: string) => {
      if (i18n.exists(`dashboard_game_options:${option}`)) {
        return t(option as DefaultGameOptions);
      }
      return t('option_unknown', { option });
    };

    const tooltipMessage = (disabledLanguage: boolean, isOptionUnknown: boolean) => {
      if (disabledLanguage) return t('language_message');
      if (isOptionUnknown) return t('can_not_disable_option');
      return undefined;
    };

    return (
      <RenderOptionContainer
        key={`active-option-${index}`}
        className="game-option"
        ref={ref}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
        }}
        isDragging={isDragging}
        dragOn={dragOn}
      >
        <div className="icon-name">
          <span className="icon" {...provided.dragHandleProps}>
            <DragIcon />
          </span>
          <span className="name">{gameOptionName(option)}</span>
        </div>
        <TooltipWrapper data-tooltip={tooltipMessage(disabledLanguage, isOptionUnknown)}>
          <DarkButton onClick={() => disableOption(option)} disabled={disabledLanguage || isOptionUnknown || disabledDisableOption}>
            {t('disable')}
          </DarkButton>
        </TooltipWrapper>
      </RenderOptionContainer>
    );
  }
);
RenderOptionActive.displayName = 'RenderOptionActive';

export const DashboardGameOptionsActive = () => {
  const { gameOptions, disableOption, changeOrder, disabledDisableOption } = useDashboardGameOptions();
  const { t } = useTranslation('dashboard_game_options');
  const [dragOn, setDragOn] = useState(false);

  return (
    <DashboardGameOptionsTableContainer>
      {gameOptions.length === 0 ? (
        <span className="empty-list">{t('no_active_option')}</span>
      ) : (
        <DragDropContext
          onDragStart={() => setDragOn(true)}
          onDragEnd={(result: DropResult) => {
            setDragOn(false);
            const srcI = result.source.index;
            const desI = result.destination?.index;
            if (desI === undefined) return;

            changeOrder(srcI, desI);
          }}
        >
          <Droppable droppableId="droppable-active-options">
            {(droppableProvided: DroppableProvided) => (
              <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                {gameOptions.map((option, index) => (
                  <Draggable key={`active-option-${index}`} draggableId={`draggable-active-options-${index}`} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <RenderOptionActive
                        ref={provided.innerRef}
                        option={option}
                        index={index}
                        provided={provided}
                        isDragging={snapshot.isDragging}
                        dragOn={dragOn}
                        disableOption={disableOption}
                        disabledDisableOption={disabledDisableOption()}
                      />
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </DashboardGameOptionsTableContainer>
  );
};
