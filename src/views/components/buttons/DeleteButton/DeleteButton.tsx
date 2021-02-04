import React, { FunctionComponent, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { BaseButton } from '../BaseButton';
import ButtonProps from '../BaseButton/ButtonPropsInterface';

const DeleteButton: FunctionComponent<ButtonProps> = (
  buttonProps: ButtonProps
) => {
  const themeContext = useContext(ThemeContext);
  return (
    <BaseButton
      onClick={buttonProps.onClick}
      backgroundColor={themeContext.colors.dangerSoft}
      textColor={themeContext.colors.dangerBase}
      text={buttonProps.text}
    >
      {buttonProps.children}
    </BaseButton>
  );
};

export { DeleteButton };
