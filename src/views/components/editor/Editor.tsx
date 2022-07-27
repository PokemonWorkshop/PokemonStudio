import { PaginationWithTitle, PaginationWithTitleProps } from '@components/PaginationWithTitle';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorContainer, EditorWithCollapseContainer } from './EditorContainer';

export const EditorTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 0 16px 0;
  user-select: none;

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
    padding: 0 0 12px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  }

  & > h3.has-pagination {
    padding-bottom: 8px;
    border-bottom: unset;
  }

  & > div {
    padding: 0 0 12px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  }
`;

type EditorProps = {
  type: 'edit' | 'movepool' | 'studio' | 'creation' | 'quest' | 'trainer' | 'importation' | 'group' | 'zone' | 'dex';
  title: string;
  children: ReactNode;
};

export const Editor = ({ type, title, children }: EditorProps) => {
  const { t } = useTranslation('editor');

  return (
    <EditorContainer>
      <EditorTitle>
        <p>{t(type)}</p>
        <h3>{title}</h3>
      </EditorTitle>
      {children}
    </EditorContainer>
  );
};

export const EditorWithCollapse = ({ type, title, children }: EditorProps) => {
  const { t } = useTranslation('editor');

  return (
    <EditorWithCollapseContainer>
      <EditorTitle>
        <p>{t(type)}</p>
        <h3>{title}</h3>
      </EditorTitle>
      {children}
    </EditorWithCollapseContainer>
  );
};

type EditorWithPaginationProps = {
  paginationProps?: PaginationWithTitleProps;
} & EditorProps;

export const EditorWithPagination = ({ type, title, children, paginationProps }: EditorWithPaginationProps) => {
  const { t } = useTranslation('editor');

  return (
    <EditorWithCollapseContainer>
      <EditorTitle>
        <p>{t(type)}</p>
        <h3 className={paginationProps ? 'has-pagination' : undefined}>{title}</h3>
        {paginationProps ? (
          <div>
            <PaginationWithTitle {...paginationProps} />
          </div>
        ) : undefined}
      </EditorTitle>
      {children}
    </EditorWithCollapseContainer>
  );
};
