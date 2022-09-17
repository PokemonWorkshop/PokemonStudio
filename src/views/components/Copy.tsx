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
};

const Copy = ({ dataToCopy, message }: CopyProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation('copy');

  const onClickCopy: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`:${dataToCopy}`);
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

export const CopyIdentifier = ({ dataToCopy }: CopyIdentifierProps) => {
  const { t } = useTranslation('copy');
  return <Copy dataToCopy={dataToCopy} message={t('identifier_message')} />;
};
