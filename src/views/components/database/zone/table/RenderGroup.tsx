import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DataGroupGrid } from './ZoneTableStyle';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import theme from '@src/AppTheme';
import { DraggableProvided } from 'react-beautiful-dnd';
import { Code } from '@components/Code';
import { padStr } from '@utils/PadStr';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioGroup } from '@modelEntities/group';
import { StudioZone } from '@modelEntities/zone';
import { CONTROL, useKeyPress } from '@utils/useKeyPress';
import { useShortcutNavigation } from '@utils/useShortcutNavigation';

type RenderGroupContainerProps = {
  isDragging: boolean;
  dragOn: boolean;
  groupDeleted: boolean;
};

const RenderGroupContainer = styled(DataGroupGrid).attrs<RenderGroupContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderGroupContainerProps>`
  box-sizing: border-box;
  min-height: 40px;
  padding: 4px 4px 4px 8px;
  margin: 0 -4px 0 -8px;
  box-shadow: ${({ isDragging }) => (isDragging ? `0 0 5px ${theme.colors.dark8}` : 'none')};

  & .drag-icon {
    color: ${theme.colors.text700};
    height: 18px;

    :hover {
      cursor: grab;
    }
  }

  & .present-on-map:nth-child(4) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    ${Code} {
      color: ${theme.colors.text100};
    }
  }

  & .buttons:nth-child(5) {
    display: flex;
    gap: 4px;
    justify-content: end;
    align-items: center;
    visibility: hidden;
  }

  & .error {
    color: ${theme.colors.dangerBase};

    &:hover {
      color: ${theme.colors.dangerBase};
    }
  }

  &:hover {
    .buttons:nth-child(5) {
      visibility: ${({ dragOn }) => (dragOn ? `hidden` : 'visible')};
    }
  }

  &[data-dragged] {
    background-color: ${theme.colors.dark14};
    color: ${theme.colors.text100};
    border-radius: 8px;
  }

  ${EditButtonOnlyIconContainer} {
    display: ${({ groupDeleted }) => (groupDeleted ? 'none' : 'flex')};
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }

  @media ${theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 160px auto;

    & .environment {
      display: none;
    }
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

type RenderGroupProps = {
  group: StudioGroup | undefined;
  zone: StudioZone;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

export const RenderGroup = React.forwardRef<HTMLInputElement, RenderGroupProps>(
  ({ group, zone, provided, isDragging, dragOn, onClickEdit, onClickDelete }, ref) => {
    const { t } = useTranslation('database_groups');
    const getGroupName = useGetEntityNameText();
    const isClickable: boolean = useKeyPress(CONTROL);
    const shortcutNavigation = useShortcutNavigation('groups', 'group', '/database/groups/');

    return (
      <RenderGroupContainer
        gap="16px"
        ref={ref}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
        }}
        isDragging={isDragging}
        dragOn={dragOn}
        groupDeleted={group === undefined}
      >
        <span className="drag-icon" {...provided.dragHandleProps}>
          <DragIcon />
        </span>
        {group ? (
          <span onClick={isClickable ? () => shortcutNavigation(group.dbSymbol) : undefined} className={isClickable ? 'clickable' : undefined}>
            {getGroupName(group)}
          </span>
        ) : (
          <span className="error">{t('group_deleted')}</span>
        )}
        {group ? <span className="environment">{t(group.systemTag)}</span> : <span className="environment" />}
        {group ? (
          <div className="present-on-map">
            {group.customConditions
              .filter((condition) => condition.type === 'mapId' && zone.maps.includes(condition.value))
              .sort((a, b) => a.value - b.value)
              .map((condition, index) => (
                <Code key={index}>{`#${padStr(condition.value, 2)}`}</Code>
              ))}
          </div>
        ) : (
          <div />
        )}
        <div className="buttons">
          <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
          <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
        </div>
      </RenderGroupContainer>
    );
  }
);
RenderGroup.displayName = 'RenderGroup';
