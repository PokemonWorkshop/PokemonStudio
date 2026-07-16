import React from 'react';
import { SmallSelect } from './styles';

/**
 * Small shared inputs used across the conditions block and command forms.
 * Module scope so they aren't re-created on every dialog render.
 */

export const OnOff = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) => (
  <SmallSelect value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled}>
    <option value={0}>ON</option>
    <option value={1}>OFF</option>
  </SmallSelect>
);

/** Named picker over the game's switch/variable list (System.rxdata). */
export const NamePicker = ({ names, value, onChange, disabled }: { names: string[]; value: number; onChange: (id: number) => void; disabled?: boolean }) => (
  <SmallSelect value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled} style={{ maxWidth: 150, flex: 1 }}>
    {names.length <= 1 && <option value={value}>{`${value}`.padStart(4, '0')}</option>}
    {names.slice(1).map((name, i) => (
      <option key={i + 1} value={i + 1}>
        {`${i + 1}`.padStart(4, '0')}
        {name ? `: ${name}` : ''}
      </option>
    ))}
  </SmallSelect>
);

export const TrueFalse = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <SmallSelect value={value ? 'true' : 'false'} onChange={(e) => onChange(e.target.value === 'true')} disabled={disabled}>
    <option value="true">TRUE</option>
    <option value="false">FALSE</option>
  </SmallSelect>
);
