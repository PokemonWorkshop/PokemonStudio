import React from 'react';
import { tokenizeRuby, type RubyToken } from '../rmxpEventUtils';

// Syntax highlighting palette — mid-saturation hues that read on both themes.
const RUBY_COLORS: Record<RubyToken['type'], string | undefined> = {
  kw: '#c792ea',
  str: '#89b859',
  sym: '#f78c6c',
  num: '#e8a75d',
  com: '#7fa25a',
  const: '#e0b566',
  gvar: '#6f9fe8',
  plain: undefined,
};

/** Renders a Ruby snippet with lightweight token coloring. */
export const RubyCode = ({ code }: { code: string }) => (
  <>
    {tokenizeRuby(code).map((token, i) => (
      <span key={i} style={token.type === 'plain' ? undefined : { color: RUBY_COLORS[token.type], fontStyle: token.type === 'com' ? 'italic' : undefined }}>
        {token.text}
      </span>
    ))}
  </>
);
