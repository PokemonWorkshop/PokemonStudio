import React from 'react';
import { CharacteristicElementProps } from './CharacteristicElementPropInterface';
import { CharacteristicElementStyle } from './CharacteristicElementStyle';

export const CharacteristicElement = (props: CharacteristicElementProps) => {
  const { label, visible } = props;

  return !visible ? <></> : <CharacteristicElementStyle>{label}</CharacteristicElementStyle>;
};
