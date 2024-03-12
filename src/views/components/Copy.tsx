import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
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
    pointer-events: none;
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

  const onLeave = () => setIsCopied(false);

  return (
    <CopyStyle onClick={onClickCopy} onMouseLeave={onLeave} data-tooltip={isCopied ? t('copied') : message} data-tooltip-remain-on-click>
      <CopyIcon />
    </CopyStyle>
  );
};

type CopyIdentifierProps = Omit<CopyProps, 'message'>;

export const CopyIdentifier = ({ dataToCopy, noColon }: CopyIdentifierProps) => {
  const { t } = useTranslation('copy');
  return <Copy dataToCopy={dataToCopy} message={t('identifier_message')} noColon={noColon} />;
};
