import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ReactComponent as SuccessIcon } from '@assets/icons/notification/success.svg';
import { ReactComponent as DangerIcon } from '@assets/icons/notification/danger.svg';
import { ReactComponent as InfoIcon } from '@assets/icons/notification/info.svg';
import { ReactComponent as WarningIcon } from '@assets/icons/notification/warning.svg';
import { assertUnreachable } from '@utils/assertUnreachable';

const NotificationContainer = styled.div`
  display: grid;
  grid-template-areas: 'icon title' 'icon message';
  grid-template-columns: 40px auto;
  row-gap: 4px;
  column-gap: 16px;
  padding: 16px;
  border-radius: 4px;
  backdrop-filter: blur(24px);
  ${({ theme }) => theme.fonts.normalMedium}
  margin-bottom: ${({ theme }) => theme.calc.titleBarHeight};

  & .icon {
    grid-area: icon;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  & .title {
    grid-area: title;
  }

  & .message {
    grid-area: message;
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text100};
  }

  &[data-type='success'] {
    background-color: ${({ theme }) => theme.colors.successSoft};
    color: ${({ theme }) => theme.colors.successBase};
    :hover {
      background-color: ${({ theme }) => theme.colors.successHover};
    }
  }

  &[data-type='danger'] {
    background-color: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.dangerBase};
    :hover {
      background-color: ${({ theme }) => theme.colors.dangerHover};
    }
  }

  &[data-type='info'] {
    background-color: ${({ theme }) => theme.colors.infoSoft};
    color: ${({ theme }) => theme.colors.infoBase};
    :hover {
      background-color: ${({ theme }) => theme.colors.infoHover};
    }
  }

  &[data-type='warning'] {
    background-color: ${({ theme }) => theme.colors.warningSoft};
    color: ${({ theme }) => theme.colors.warningBase};
    :hover {
      background-color: ${({ theme }) => theme.colors.warningHover};
    }
  }
`;

type NotificationProps = {
  type: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  message: string;
};

type RenderNotificationProps = NotificationProps & { children: ReactNode };

const RenderNotification = ({ type, title, message, children }: RenderNotificationProps) => (
  <NotificationContainer data-type={type}>
    <div className="icon">{children}</div>
    <div className="title">{title}</div>
    <div className="message">{message}</div>
  </NotificationContainer>
);

export const Notification = ({ type, title, message }: NotificationProps) => {
  switch (type) {
    case 'success':
      return (
        <RenderNotification type={type} title={title} message={message}>
          <SuccessIcon />
        </RenderNotification>
      );
    case 'danger':
      return (
        <RenderNotification type={type} title={title} message={message}>
          <DangerIcon />
        </RenderNotification>
      );
    case 'info':
      return (
        <RenderNotification type={type} title={title} message={message}>
          <InfoIcon />
        </RenderNotification>
      );
    case 'warning':
      return (
        <RenderNotification type={type} title={title} message={message}>
          <WarningIcon />
        </RenderNotification>
      );
    default:
      assertUnreachable(type);
      return <></>;
  }
};
