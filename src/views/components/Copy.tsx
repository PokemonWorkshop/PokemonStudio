import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CopyIcon } from '@assets/icons/global/copy.svg';
import { DarkButton } from './buttons';

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
  dataToCopy: string | (() => Promise<string> | string);
  message: string;
  noColon?: true;
  children?: ReactNode;
};

const Copy = ({ dataToCopy, message, noColon, children }: CopyProps) => {
  const { t } = useTranslation();

  const onClickCopy: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = async (event) => {
    event.stopPropagation();
    try {
      const text = await (typeof dataToCopy === 'string' ? dataToCopy : dataToCopy());
      navigator.clipboard.writeText(`${noColon ? '' : ':'}${text}`);
      window.dispatchEvent(new CustomEvent('tooltip:ChangeText', { detail: t('copied') }));
    } catch {
      window.dispatchEvent(new CustomEvent('tooltip:ChangeText', { detail: t('failed_to_copy') }));
    }
  };

  if (children)
    return (
      <DarkButton onClick={onClickCopy} data-tooltip={message} data-tooltip-remain-on-click data-tooltip-position="center">
        {children}
      </DarkButton>
    );

  return (
    <CopyStyle onClick={onClickCopy} data-tooltip={message} data-tooltip-remain-on-click>
      <CopyIcon />
    </CopyStyle>
  );
};

type CopyIdentifierProps = Omit<CopyProps, 'message'>;

export const CopyIdentifier = ({ dataToCopy, noColon }: CopyIdentifierProps) => {
  const { t } = useTranslation();
  return <Copy dataToCopy={dataToCopy} message={t('identifier_message')} noColon={noColon} />;
};

export const CopyButton = (props: Omit<CopyProps, 'noColon'>) => <Copy {...props} noColon />;
