import React, { FunctionComponent } from 'react';
import { PokemonDataBlock } from '../PokemonDataBlock';
import { StatisticsDataBlockField } from './StatisticsDataBlockField';
import { StatisticsDataBlockFieldGroup } from './StatisticsDataBlockFieldGroup/StatisticsDataBlockFieldGroup';
import { StatisticsDataBlockFieldset } from './StatisticsDataBlockFieldset/StatisticsDataBlockFieldset';

export const StatisticsDataBlock: FunctionComponent = () => {
  return (
    <PokemonDataBlock title="Statistics" size="m">
      <StatisticsDataBlockFieldset>
        <StatisticsDataBlockFieldGroup title="Statistiques de base">
          <StatisticsDataBlockField label="Points de vie" data={255} />
          <StatisticsDataBlockField label="Attaque" data={255} />
          <StatisticsDataBlockField label="Défense" data={255} />
          <StatisticsDataBlockField label="Attaque spéciale" data={255} />
          <StatisticsDataBlockField label="Défense spéciale" data={255} />
          <StatisticsDataBlockField label="Vitesse" data={255} />
        </StatisticsDataBlockFieldGroup>

        <StatisticsDataBlockFieldGroup title="Effort Value (EV)">
          <StatisticsDataBlockField label="Points de vie" data={255} />
          <StatisticsDataBlockField label="Attaque" data={255} />
          <StatisticsDataBlockField label="Défense" data={255} />
          <StatisticsDataBlockField label="Attaque spéciale" data={255} />
          <StatisticsDataBlockField label="Défense spéciale" data={255} />
          <StatisticsDataBlockField label="Vitesse" data={255} />
        </StatisticsDataBlockFieldGroup>
      </StatisticsDataBlockFieldset>
    </PokemonDataBlock>
  );
};
