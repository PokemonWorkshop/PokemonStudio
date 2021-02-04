import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveDataBlock } from '../MoveDataBlock';
import { MoveDataBlockFieldset } from '../MoveDataBlockFieldset';
import { MoveDataBlockFieldsetField } from '../MoveDataBlockFieldsetField';

export const ParametersDataBlock: FunctionComponent = () => {
  const { t } = useTranslation('database_moves');

  const battleEngineMethods: Record<string, string> = {
    s_basic: 'Attaque classique',
    s_stat: 'Attaque changeant les statistiques',
    s_status: 'Attaque de statut',
    s_multi_hit: "Attaque infligeant jusqu'à 5 coups",
    s_2hits: 'Attaque infligeant 2 coups',
    s_ohko: 'Attaque OHKO',
    s_2turns: 'Attaque en 2 tours',
    s_self_stat: 'Attaque changeant les statistiques sur soi',
    s_self_statut: 'Attaque infligeant un statut sur soi',
  };

  function getCategory() {
    const battleEngineMethod = 's_basic'; // remove when using move.battleEngineMethod
    if (battleEngineMethods[battleEngineMethod] === undefined)
      return 'Attaque personnalisée';
    return battleEngineMethods[battleEngineMethod];
  }

  return (
    <MoveDataBlock title={t('settings')} size="m">
      <MoveDataBlockFieldset>
        <MoveDataBlockFieldsetField
          label={t('target')}
          data={t('adjacent_pokemon')}
        />
        <MoveDataBlockFieldsetField
          label={t('category')}
          data={getCategory()}
          size="m"
        />
        <MoveDataBlockFieldsetField label={t('symbol')} data="s_basic" />
      </MoveDataBlockFieldset>
    </MoveDataBlock>
  );
};
