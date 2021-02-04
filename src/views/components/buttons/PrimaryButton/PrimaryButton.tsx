import React, { FunctionComponent, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { BaseButton } from '../BaseButton';
import ButtonProps from '../BaseButton/ButtonPropsInterface';

const PrimaryButton: FunctionComponent<ButtonProps> = (
  buttonProps: ButtonProps
) => {
  const themeContext = useContext(ThemeContext);
  return (
    <BaseButton
      onClick={buttonProps.onClick}
      backgroundColor={themeContext.colors.primaryBase}
      textColor={themeContext.colors.textColor}
      text={buttonProps.text}
      disabled={buttonProps.disabled}
    >
      {buttonProps.children}
    </BaseButton>
  );
};

export { PrimaryButton };
