import { Select } from '@ds/Select';
import React from 'react';

const options = [
  { value: 'a', label: 'Normal option' },
  { value: 'b', label: 'Long option without specific tooltip to explain it' },
  { value: 'c', label: 'Complicated option', tooltip: 'Selecting this option makes this and that, tbh it is not easy to explain' },
  { value: 'd', label: 'Complicated option with a lot of text', tooltip: 'This tooltip only show in select list!' },
] as const;

export const ToolTipExamples = () => {
  return (
    <div style={{ padding: '32px', width: '100%', overflow: 'auto' }}>
      <h2>Tooltip in selects</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Select options={options} />
        <Select options={options} />
      </div>
      <h2 style={{ marginTop: '80vh' }}>Tooltip in other elements</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* @ts-ignore */}
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', 'text-wrap': 'nowrap', maxWidth: '60px' }}>Tooltip showing truncated text.</span>
        <span data-tool-tip="Hidden detail text!">Tooltip showing details</span>
        <span data-tool-tip-id="hiddenToolTip">Fancy tooltip</span>
      </div>
      <div id="hiddenToolTip" style={{ display: 'none' }}>
        <span>Some nicer </span>
        <span style={{ color: 'green' }}>ToolTip</span>
        <span> !</span>
      </div>
    </div>
  );
};
