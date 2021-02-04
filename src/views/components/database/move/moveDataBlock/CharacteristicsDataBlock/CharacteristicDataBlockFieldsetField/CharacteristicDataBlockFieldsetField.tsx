import React, { FunctionComponent } from 'react';
import { CharacteristicsDataBlockFieldsetFieldProps } from './CharacteristicDataBlockFieldsetFieldPropInterface';
import { CharacteristicsDataBlockFieldsetFieldStyle } from './CharacteristicsDataBlockFieldsetFieldStyle';

export const CharacteristicsDataBlockFieldsetField: FunctionComponent<CharacteristicsDataBlockFieldsetFieldProps> = (
  props: CharacteristicsDataBlockFieldsetFieldProps
) => {
  const { name } = props;

  return (
    <CharacteristicsDataBlockFieldsetFieldStyle>
      {name}
    </CharacteristicsDataBlockFieldsetFieldStyle>
  );
};
