import PlusIcon from '@assets/icons/global/plus-icon.svg';
import type { StudioEventCommandCategory } from '@modelEntities/event/category';
import React from 'react';
import styled from 'styled-components';

type EventCategoryIconContainerProps = {
  size: 's' | 'm';
};

export const EventCategoryIconContainer = styled.div.attrs<EventCategoryIconContainerProps>((props) => ({
  'data-size': props.size,
}))<EventCategoryIconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  color: rgb(28, 31, 39);

  &[data-color='violet'] {
    background-color: rgb(149, 89, 208);
  }

  &[data-color='blue'] {
    background-color: rgb(37, 113, 201);
  }

  &[data-size='s'] {
    height: 24px;
    min-width: 24px;

    svg {
      width: 10px;
      height: auto;
    }
  }
`;

export const IconsFromCategory: Record<StudioEventCommandCategory, { icon: JSX.Element; color: string }> = {
  flow_control: { icon: <PlusIcon />, color: 'violet' },
  game_interfaces: { icon: <PlusIcon />, color: 'violet' },
  messages: { icon: <PlusIcon />, color: 'violet' },
  player_interaction: { icon: <PlusIcon />, color: 'blue' },
};

type EventCategoryIconProps = {
  category: StudioEventCommandCategory;
  size: 's' | 'm';
};

export const EventCategoryIcon = ({ category, size }: EventCategoryIconProps) => {
  const { icon, color } = IconsFromCategory[category];

  return (
    <EventCategoryIconContainer data-color={color} size={size}>
      {icon}
    </EventCategoryIconContainer>
  );
};
