import { Notification } from '@components/Notification';
import React from 'react';
import { Store } from 'react-notifications-component';

type NotificationType = 'success' | 'danger' | 'info' | 'warning';

/**
 * Show a notification
 * @example
 *   <Component onClick={() => showNotification('success', 'onClick', 'You successfully triggered onClick')} />
 */
export const showNotification = (type: NotificationType, title: string, message: string) => {
  Store.addNotification({
    content: <Notification type={type} title={title} message={message} />,
    container: 'bottom-right',
    insert: 'bottom',
    dismiss: {
      duration: 5000,
    },
  });
};
