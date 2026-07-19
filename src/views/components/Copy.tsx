import CopyIcon from '@assets/icons/global/copy.svg';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { showNotification } from '@utils/showNotification';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DarkButton } from './buttons';

export const CopyStyle = styled.button`
  padding: 8px;
  min-width: 32px;
  min-height: 32px;
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  display: flex;
  align-items: center;
  justify-content: center;

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

const copyData = async (dataToCopy: CopyProps['dataToCopy'], noColon?: true): Promise<string> => {
  const text = await (typeof dataToCopy === 'string' ? dataToCopy : dataToCopy());
  const copiedText = `${noColon ? '' : ':'}${text}`;
  await navigator.clipboard.writeText(copiedText);
  return copiedText;
};

const Copy = ({ dataToCopy, message, noColon, children }: CopyProps) => {
  const { t } = useTranslation();

  const onClickCopy: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = async (event) => {
    event.stopPropagation();
    try {
      await copyData(dataToCopy, noColon);
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
  const shortcut = window.api.platform === 'darwin' ? 'Option + Shift + C' : 'Ctrl + Shift + C';

  const shortcutMap = useMemo<StudioShortcutActions>(
    () => ({
      db_copy_identifier: async () => {
        try {
          const copiedText = await copyData(dataToCopy, noColon);
          showNotification('success', t('copied'), copiedText);
        } catch {
          showNotification('danger', t('failed_to_copy'), '');
        }
      },
    }),
    [dataToCopy, noColon, t],
  );
  useShortcut(shortcutMap);

  return <Copy dataToCopy={dataToCopy} message={t('identifier_message', { shortcut })} noColon={noColon} />;
};

export const CopyButton = (props: Omit<CopyProps, 'noColon'>) => <Copy {...props} noColon />;
