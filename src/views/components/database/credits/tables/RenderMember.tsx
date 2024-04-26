import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { DataMemberGrid } from './CreditMemberTableStyle';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import theme from '@src/AppTheme';
import { DraggableProvided } from 'react-beautiful-dnd';
import { TFunction, useTranslation } from 'react-i18next';

type RenderMemberContainerProps = {
  isDragging: boolean;
  dragOn: boolean;
  memberDeleted: boolean;
};

const RenderMemberContainer = styled(DataMemberGrid).attrs<RenderMemberContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderMemberContainerProps>`
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

  & .role {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .buttons {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
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
    .buttons {
      visibility: ${({ dragOn }) => (dragOn ? `hidden` : 'visible')};
    }
  }

  &[data-dragged] {
    background-color: ${theme.colors.dark14};
    color: ${theme.colors.text100};
    border-radius: 8px;
  }

  ${EditButtonOnlyIconContainer} {
    display: ${({ memberDeleted }) => (memberDeleted ? 'none' : 'flex')};
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }

  @media ${theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 160px 144px auto;
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

type RenderMemberProps = {
  member: {
    title: string;
    name: string;
  };
  index: number;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

const showMemberName = (name: string, t: TFunction<'dashboard_credits'>) => {
  const splits = name.split(/,\s*/);
  const countMembers = splits.length;
  if (countMembers <= 3) return name;

  const names = splits.slice(0, 3);
  const others = countMembers - 3 > 1 ? t('others', { count: countMembers - 3 }) : t('other', { count: 1 });
  return names.map((member) => ' ' + member) + `, ${others}`;
};

export const RenderMember = forwardRef<HTMLDivElement, RenderMemberProps>(
  ({ member, provided, isDragging, dragOn, onClickEdit, onClickDelete }, ref) => {
    const { t } = useTranslation('dashboard_credits');

    return (
      <RenderMemberContainer
        gap="16px"
        ref={ref}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
        }}
        isDragging={isDragging}
        dragOn={dragOn}
        memberDeleted={member === undefined}
      >
        <span className="drag-icon" {...provided.dragHandleProps}>
          <DragIcon />
        </span>
        <span className="role">{member.title}</span>
        <span>{showMemberName(member.name, t)}</span>
        <div className="buttons" style={{ display: 'flex', gap: '4px' }}>
          <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
          <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
        </div>
      </RenderMemberContainer>
    );
  }
);

RenderMember.displayName = 'RenderMember';
