import React from 'react';
import styled from 'styled-components';
import { SecondaryButton } from '.';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-button.svg';

const RoundButton = styled(SecondaryButton)`
  width: 48px;
  height: 48px;
  border-radius: 100px;
  padding: 0;
`;

type PlusCircleButtonProps = {
  onClick: () => void;
};

export const PlusCircleButton = ({ onClick }: PlusCircleButtonProps) => {
  return (
    <RoundButton onClick={onClick}>
      <PlusIcon />
    </RoundButton>
  );
};
