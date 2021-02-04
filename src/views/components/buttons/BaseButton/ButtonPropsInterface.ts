import { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  backgroundColor?: string;
  textColor?: string;
  text?: string;
  onClick?: MouseEventHandler;
  children?: ReactNode;
  disabled?: boolean;
};

export default ButtonProps;
