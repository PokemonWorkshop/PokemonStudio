import React from 'react';
import styled from 'styled-components';
import type { StudioEventCommandCategory } from '@modelEntities/event';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { useTranslation } from 'react-i18next';

const EventCommandCategoryContainer = styled.div.attrs((props) => ({ 'data-color': props.color }))`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  height: 100px;
  justify-content: space-between;
  align-items: center;
  background-blend-mode: overlay, normal;
  border-radius: 8px;
  cursor: pointer;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    border-radius: 100%;
    color: ${({ theme }) => theme.colors.text100};
  }

  .title {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
    text-align: center;
  }

  &[data-color='violet'] {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 100%), rgb(39, 27, 53);
    border: 0.5px solid rgb(58, 36, 80);
    box-shadow: 0px 1px 1px -0.5px rgba(0, 0, 0, 0.05), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.05);

    .icon {
      background-color: rgb(149, 89, 208);
    }
  }

  &[data-color='blue'] {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.05) 100%), rgb(9, 36, 56);
    border: 0.5px solid rgb(3, 51, 83);
    box-shadow: 0px 1px 1px -0.5px rgba(0, 0, 0, 0.05), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.05);

    .icon {
      background-color: rgb(37, 113, 201);
    }
  }
`;

// TODO: Update icons and colors
export const IconsFromCategory: Record<StudioEventCommandCategory, { icon: JSX.Element; color: string }> = {
  flow_control: { icon: <PlusIcon />, color: 'violet' },
  game_interfaces: { icon: <PlusIcon />, color: 'violet' },
  messages: { icon: <PlusIcon />, color: 'violet' },
  player_interaction: { icon: <PlusIcon />, color: 'blue' },
};

type EventCommandCategoryProps = {
  category: StudioEventCommandCategory;
  onClick: () => void;
};

export const EventCommandCategory = ({ category, onClick }: EventCommandCategoryProps) => {
  const { t } = useTranslation();
  const { icon, color } = IconsFromCategory[category];

  return (
    <EventCommandCategoryContainer onClick={onClick} color={color}>
      <span className="icon">{icon}</span>
      <span className="title">{t(`event_category_${category}`)}</span>
    </EventCommandCategoryContainer>
  );
};
