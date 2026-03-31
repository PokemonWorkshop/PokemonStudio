import { Notification, NotificationWrapper } from '@components/Notification';
import { toast } from 'react-hot-toast';
import React from 'react';

type NotificationType = 'success' | 'danger' | 'info' | 'warning';

/**
 * Show a notification
 * @example
 *   <Component onClick={() => showNotification('success', 'onClick', 'You successfully triggered onClick')} />
 */
export const showNotification = (type: NotificationType, title: string, message: string) => {
  toast.custom(
    (t) => (
      <NotificationWrapper visible={t.visible}>
        <Notification type={type} title={title} message={message} />
      </NotificationWrapper>
    ),
    { duration: 5000 },
  );
};
