import styled from 'styled-components';
import { Category } from './Category';
import { QuestCategory as QuestCategoryType, QuestResolution as QuestResolutionType } from '@modelEntities/quest/Quest.model';

type QuestCategoryProps = { category: QuestCategoryType | QuestResolutionType };

export const QuestCategory = styled(Category).attrs<QuestCategoryProps>((props) => ({
  'data-category': props.category,
}))<QuestCategoryProps>`
  &[data-category='primary'] {
    background: rgba(247, 189, 38, 0.12);
    color: rgba(247, 189, 38, 1);
  }

  &[data-category='secondary'] {
    background: rgba(53, 175, 243, 0.12);
    color: rgba(53, 175, 243, 1);
  }

  &[data-category='default'] {
    background: rgba(185, 171, 168, 0.12);
    color: rgba(185, 171, 168, 1);
  }

  &[data-category='progressive'] {
    background: rgba(37, 203, 44, 0.12);
    color: rgba(37, 203, 44, 1);
  }
`;
