import { useTranslation } from 'react-i18next';

export const useSharedOptions = () => {
  const { t } = useTranslation();

  const globalStaticEvent = () => [{ label: t('event_command_wait_move_completion_multiselect_static_player'), value: 'player' }];
  return {
    globalStaticEvent,
  };
};
