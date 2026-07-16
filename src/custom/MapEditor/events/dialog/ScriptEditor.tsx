import React, { useRef } from 'react';
import { ScriptEditorWrap, ScriptHighlight, ScriptTextArea } from './styles';
import { RubyCode } from './RubyCode';

/** Script command editor: live Ruby syntax highlighting while typing. */
export const ScriptEditor = ({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };
  return (
    <ScriptEditorWrap>
      <ScriptHighlight ref={preRef} aria-hidden="true">
        {/* Trailing newline keeps the last line visible while typing. */}
        <RubyCode code={`${value}\n`} />
      </ScriptHighlight>
      <ScriptTextArea
        ref={taRef}
        value={value}
        spellCheck={false}
        autoFocus={autoFocus}
        onScroll={syncScroll}
        onChange={(e) => onChange(e.target.value)}
      />
    </ScriptEditorWrap>
  );
};
