import React, { FunctionComponent } from 'react';
import ButtonProps from './ButtonPropsInterface';
import { BaseButtonStyle } from './BaseButtonStyle';

const BaseButton: FunctionComponent<ButtonProps> = (
  buttonProps: ButtonProps
) => {
  return (
    <BaseButtonStyle
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      backgroundColor={buttonProps.backgroundColor}
      textColor={buttonProps.textColor}
    >
      {buttonProps.children}
      {buttonProps.text}
    </BaseButtonStyle>
  );
};

export { BaseButton };
