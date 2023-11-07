import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ClearButtonOnlyIcon } from './buttons';

const DialogContainer = styled.div`
  display: flex;
  width: 700px;
  height: 614px;
  padding: 24px 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  box-sizing: border-box;

  .header {
    display: flex;
    justify-content: flex-end;
    align-self: stretch;
    user-select: none;
  }

  .header-title {
    display: flex;
    height: 49px;
    flex-direction: column;
    justify-content: space-between;
    flex: 1 0 0;
  }

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6}
    color: ${({ theme }) => theme.colors.text100};
  }

  .sub-title {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};

    &.error {
      color: ${({ theme }) => theme.colors.dangerBase};
    }
  }
`;

type DialogProps = {
  title: string;
  subTitle: string;
  children: ReactNode;
  closeDialog?: () => void;
  hasError?: boolean;
};

export const Dialog = ({ title, subTitle, children, closeDialog, hasError }: DialogProps) => {
  return (
    <DialogContainer>
      <div className="header">
        <div className="header-title">
          <span className="title">{title}</span>
          <span className={`sub-title ${hasError && 'error'}`}>{subTitle}</span>
        </div>
        <ClearButtonOnlyIcon onClick={closeDialog} disabled={!closeDialog} />
      </div>
      {children}
    </DialogContainer>
  );
};
