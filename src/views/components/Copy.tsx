import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ToolTip, ToolTipContainerForCopy } from './Tooltip';
import { ReactComponent as CopyIcon } from '@assets/icons/global/copy.svg';

export const CopyStyle = styled.button`
  padding: 0px;
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;

  & svg {
    color: ${({ theme }) => theme.colors.text400};
  }
`;

type CopyProps = {
  dataToCopy: string;
  message: string;
  noColon?: true;
};

const Copy = ({ dataToCopy, message, noColon }: CopyProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation('copy');

  const onClickCopy: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`${noColon ? '' : ':'}${dataToCopy}`);
    setIsCopied(true);
  };

  return (
    <ToolTipContainerForCopy>
      <ToolTip bottom="100%">{isCopied ? t('copied') : message}</ToolTip>
      <CopyStyle onClick={onClickCopy} onMouseLeave={() => setIsCopied(false)}>
        <CopyIcon />
      </CopyStyle>
    </ToolTipContainerForCopy>
  );
};

type CopyIdentifierProps = Omit<CopyProps, 'message'>;

export const CopyIdentifier = ({ dataToCopy, noColon }: CopyIdentifierProps) => {
  const { t } = useTranslation('copy');
  return <Copy dataToCopy={dataToCopy} message={t('identifier_message')} noColon={noColon} />;
};
