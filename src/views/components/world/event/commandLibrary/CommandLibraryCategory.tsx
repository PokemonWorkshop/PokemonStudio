import React from 'react';
import styled from 'styled-components';
import type { StudioEventCommandCategory } from '@modelEntities/event/category';
import { useTranslation } from 'react-i18next';
import { EventIcon, EventCategoryIconContainer } from '../generic/EventIcon';

const CommandLibraryCategoryContainer = styled.div.attrs((props) => ({ 'data-color': props.color }))`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px;
  gap: 12px;

  :hover {
    cursor: pointer;
    background-color: rgb(41, 43, 48);
    border-radius: 16px;

    ${EventCategoryIconContainer} {
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  .title {
    display: -webkit-box;
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

type CommandLibraryCategoryProps = {
  category: StudioEventCommandCategory;
  onClick: () => void;
};

export const CommandLibraryCategory = ({ category, onClick }: CommandLibraryCategoryProps) => {
  const { t } = useTranslation();

  return (
    <CommandLibraryCategoryContainer onClick={onClick}>
      <EventIcon icon={{ type: 'category', category }} size="m" />
      <span className="title">{t(`event_category_${category}`)}</span>
    </CommandLibraryCategoryContainer>
  );
};
