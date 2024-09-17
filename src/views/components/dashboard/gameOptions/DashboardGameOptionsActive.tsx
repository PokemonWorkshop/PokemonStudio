import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardGameOptions } from './useDashboardGameOptions';
import { DashboardGameOptionsTableContainer, RenderOptionContainer } from './DashboardGameOptionsStyle';
import { DarkButton } from '@components/buttons';
import { TooltipWrapper } from '@ds/Tooltip';
import { DEFAULT_GAME_OPTIONS, DefaultGameOptions } from '@modelEntities/config';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { createSwapy } from 'swapy';

type RenderOptionActiveProps = {
  index: number;
  option: string;
  disabledDisableOption: boolean;
  disableOption: (option: string) => void;
};

const RenderOptionActive = ({ index, option, disabledDisableOption, disableOption }: RenderOptionActiveProps) => {
  const { t, i18n } = useTranslation('dashboard_game_options');
  const disabledLanguage = option === 'language';
  const isOptionUnknown = !(DEFAULT_GAME_OPTIONS as readonly string[]).includes(option);

  const gameOptionName = (option: string) => {
    if (i18n.exists(`dashboard_game_options:${option}`)) {
      return t(option as DefaultGameOptions);
    }
    return t('option_unknown', { option });
  };

  const tooltipMessage = (disabledLanguage: boolean, isOptionUnknown: boolean) => {
    if (disabledLanguage) return t('language_message');
    if (isOptionUnknown) return t('can_not_disable_option');
    return undefined;
  };

  return (
    <RenderOptionContainer key={`active-option-${index}`} className="game-option" data-swapy-slot={index}>
      <div className="icon-name">
        <span className="icon" data-swapy-handle>
          <DragIcon />
        </span>
        <span className="name">{gameOptionName(option)}</span>
      </div>
      <TooltipWrapper data-tooltip={tooltipMessage(disabledLanguage, isOptionUnknown)}>
        <DarkButton onClick={() => disableOption(option)} disabled={disabledLanguage || isOptionUnknown || disabledDisableOption}>
          {t('disable')}
        </DarkButton>
      </TooltipWrapper>
    </RenderOptionContainer>
  );
};

export const DashboardGameOptionsActive = () => {
  const { gameOptions, disableOption, changeOrder, disabledDisableOption } = useDashboardGameOptions();
  const { t } = useTranslation('dashboard_game_options');
  const gameOptionsActiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameOptionsActiveRef.current) return;

    //console.log(createSwapy);
    const swapy = createSwapy(gameOptionsActiveRef.current); // crash here
    swapy.onSwap(({ data }) => {
      console.log(data);
      // TODO: changeOrder
    });

    return () => {
      swapy.destroy();
    };
  }, []);

  return (
    <DashboardGameOptionsTableContainer ref={gameOptionsActiveRef}>
      {gameOptions.length === 0 ? (
        <span className="empty-list">{t('no_active_option')}</span>
      ) : (
        gameOptions.map((option, index) => (
          <RenderOptionActive
            option={option}
            index={index}
            disableOption={disableOption}
            disabledDisableOption={disabledDisableOption()}
            key={`active-option-${index}`}
          />
        ))
      )}
    </DashboardGameOptionsTableContainer>
  );
};
