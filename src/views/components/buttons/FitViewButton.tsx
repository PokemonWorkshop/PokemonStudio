import FitViewIcon from '@assets/icons/global/fitview.svg';
import React from 'react';

type FitViewButtonProps = {
  onClick: () => void;
};

export const FitViewButton = ({ onClick }: FitViewButtonProps) => {
  return (
    <button
      type="button"
      className="react-flow__controls-button react-flow__controls-fitview"
      title="fit view"
      aria-label="fit view"
      onClick={onClick}
    >
      <FitViewIcon />
    </button>
  );
};
