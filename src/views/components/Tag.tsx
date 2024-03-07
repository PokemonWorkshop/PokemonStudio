import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ReactComponent as ClearIcon } from '@assets/icons/global/clear-tag-icon.svg';

export const Tag = styled.span`
  display: flex;
  width: max-content;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 20px;
  padding: 4px 12px;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text100};
`;

export const SecondaryTag = styled(Tag)`
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryBase};
`;

export const TagWithAction = styled(Tag)`
  cursor: pointer;
  outline-offset: -2px;

  :hover {
    outline: 2px solid ${({ theme }) => theme.colors.text600};
  }

  :active {
    outline: 2px solid ${({ theme }) => theme.colors.text400};
  }
`;

type TagWithDeletionContainerProps = {
  noDeletion: boolean;
  noAction: boolean;
};

export const TagWithDeletionContainer = styled(TagWithAction)<TagWithDeletionContainerProps>`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding-right: ${({ noDeletion }) => (noDeletion ? '12px' : '8px')};
  cursor: ${({ noAction }) => (noAction ? 'default' : 'pointer')};
  user-select: none;

  & :hover {
    outline-style: ${({ noAction }) => (noAction ? 'none' : 'block')};
  }

  & :active {
    outline-style: ${({ noAction }) => (noAction ? 'none' : 'block')};
  }

  & .clear-icon {
    display: flex;
    color: ${({ theme }) => theme.colors.text500};
  }

  &:hover {
    & .clear-icon {
      cursor: pointer;
      color: ${({ theme }) => theme.colors.text400};

      &:hover {
        color: ${({ theme }) => theme.colors.text100};
      }
    }
  }
`;

type TagWithDeletionProps = {
  children: ReactNode;
  index: number;
  onClickDelete: (index: number) => void;
  onClick?: () => void;
  noDeletion?: boolean;
};

export const TagWithDeletion = ({ children, index, onClickDelete, onClick, noDeletion }: TagWithDeletionProps) => {
  const onDelete: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    onClickDelete(index);
  };

  return (
    <TagWithDeletionContainer onClick={onClick} noDeletion={noDeletion || false} noAction={onClick === undefined}>
      {children}
      {!noDeletion && (
        <div className="clear-icon" onClick={onDelete}>
          <ClearIcon />
        </div>
      )}
    </TagWithDeletionContainer>
  );
};

type TagWithSelectionProps = {
  selected: boolean;
};

export const TagWithSelection = styled(Tag)<TagWithSelectionProps>`
  cursor: pointer;
  outline-offset: -2px;
  user-select: none;

  outline: 2px ${({ selected }) => (selected ? 'none' : 'block')} ${({ theme }) => theme.colors.text600};

  &:hover {
    outline: 2px solid ${({ theme }) => theme.colors.text400};
  }

  background-color: ${({ theme, selected }) => (selected ? theme.colors.primaryBase : theme.colors.dark20)};
`;
