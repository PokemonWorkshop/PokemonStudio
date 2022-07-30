import { DataBlockContainer } from '@components/database/dataBlocks';
import { DataBlockContainerColor } from '@components/database/dataBlocks/DataBlockContainer';
import styled from 'styled-components';

export const DataBlockEditorContainer = styled(DataBlockContainer)`
  display: flex;
  flex-direction: column;
  gap: 16px;

  // TODO: Remove h3 rule from global style & remove '#root ' from here!
  #root &[data-disabled='true'] h3 {
    color: ${({ theme }) => theme.colors.dark20};
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  & > p {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    margin: 0;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  & > h3 {
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text100};
    margin: 0;
    line-height: 22px;
  }
`;

type ButtonContainerProps = {
  color?: DataBlockContainerColor;
};

export const ButtonContainer = styled.div<ButtonContainerProps>`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${({ theme, color }) => (color === 'light' ? theme.colors.dark20 : theme.colors.dark18)};
  padding: 16px 0 0 0;
  margin-top: 4px;
  justify-content: space-between;
`;

export const ButtonRightContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;
