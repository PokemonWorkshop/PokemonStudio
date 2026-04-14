import { Input, MultiLineInput } from '@components/inputs';
import { ClearInputContainer, ClearInputProps, useClearInput } from './ClearInput';
import ClearIcon from '@assets/icons/global/clear-tag-icon.svg';
import styled, { css } from 'styled-components';
import React, { forwardRef } from 'react';

const sharedInputStyles = css`
  background-color: rgba(255, 255, 255, 0.0001);
  box-shadow:
    0px 3px 1px -2px rgba(38, 47, 56, 0.06),
    0px 2px 3px rgba(38, 47, 56, 0.05),
    0px 0px 0px 1px rgba(202, 211, 241, 0.13);
  border-radius: 8px;
`;

const NodeInputContainer = styled(Input)`
  ${sharedInputStyles}
  height: 32px;
`;

const NodeMultiLineInputContainer = styled(MultiLineInput)`
  ${sharedInputStyles}
  field-sizing: unset;
  resize: vertical;
  min-height: 76px;
`;

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const NodeInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <NodeInputContainer {...props} className={`nodrag ${className ?? ''}`.trim()} onClick={stopPropagation} onDoubleClick={stopPropagation} />
);

export const NodeMultiLineInput = ({ className, ...props }: React.ComponentProps<typeof MultiLineInput>) => (
  <NodeMultiLineInputContainer {...props} className={`nodrag ${className ?? ''}`.trim()} onClick={stopPropagation} onDoubleClick={stopPropagation} />
);

export const NodeClearInput = forwardRef<HTMLInputElement, ClearInputProps>((props, ref) => {
  const { inputProps, isIconShown, onChange, handleClear } = useClearInput(props, ref);

  return (
    <ClearInputContainer>
      <NodeInput {...inputProps} ref={ref} onChange={onChange} />
      {isIconShown && <ClearIcon onClick={handleClear} />}
    </ClearInputContainer>
  );
});
NodeClearInput.displayName = 'NodeClearInput';
