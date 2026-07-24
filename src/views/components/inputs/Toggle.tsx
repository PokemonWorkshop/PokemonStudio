import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { playSound } from '@utils/sound';

/**
 * The actual slider. Renamed from `Toggle` so the exported `Toggle` below can
 * be a thin sound-playing wrapper around it without shadowing itself.
 */
const ToggleInput = styled.input.attrs(() => ({ type: 'checkbox' }))`
  appearance: none;
  width: 30px;
  height: 18px;
  padding: 2px;
  margin: 0;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.colors.dark24};
  transition: 0.2s;

  &:hover {
    cursor: pointer;
  }

  &:checked {
    background-color: ${({ theme }) => theme.colors.primaryBase};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.dark22};
    cursor: not-allowed;
  }

  &::before {
    content: '';
    background-color: ${({ theme }) => theme.colors.text100};
    position: relative;
    left: 0px;
    width: 14px;
    height: 14px;
    display: block;
    border-radius: 100%;
    transition: 0.2s;
  }

  &:checked::before {
    left: 12px;
  }

  &:disabled::before {
    background-color: ${({ theme }) => theme.colors.text500};
  }
`;

/**
 * Studio's shared checkbox-styled toggle, centrally wired to play the
 * `toggle` cue on every change. ~39 call sites render this component (some
 * indirectly through `useInputAttrs`'s generated `Toggle` field), so the
 * sound is added once here rather than at each call site.
 *
 * Forwards the ref to the underlying `<input>` (several editors read
 * `ref.current.checked` on submit instead of using controlled state) and
 * spreads every other prop — including `className` — straight through, so
 * `styled(Toggle)` extensions keep working exactly as they did against the
 * old bare `styled.input`.
 *
 * `type` is deliberately excluded from the prop type: `ToggleInput` always
 * forces `type="checkbox"` via `.attrs()`, so there's nothing meaningful for
 * a caller to pass there, and forwarding an arbitrary `HTMLInputTypeAttribute`
 * through would conflict with that fixed `"checkbox"` attrs type.
 */
type ToggleProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({ onChange, ...props }, ref) => (
  <ToggleInput
    ref={ref}
    {...props}
    onChange={(event) => {
      playSound('toggle');
      onChange?.(event);
    }}
  />
));
Toggle.displayName = 'Toggle';
