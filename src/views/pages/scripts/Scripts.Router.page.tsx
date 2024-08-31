import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouterPageStyle } from '@components/pages';
import { editor, Uri } from 'monaco-editor';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';

const MainScript = () => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      const handle = editor.create(divRef.current, {
        readOnly: true,
        model: editor.createModel('def test2\n  p 0\nend\n', 'ruby', Uri.parse('urn:test2.rb')),
        fontFamily: 'monospace',
        fontSize: 16,
        theme: 'vs-dark',
        minimap: { enabled: false },
      });
      return () => {
        handle.getModel()?.dispose();
        handle.dispose();
      };
    }
  }, []);

  return <div style={{ width: '100%' }} ref={divRef}></div>;
};

const ScriptRouterComponent = () => {
  return (
    <RouterPageStyle>
      <Routes>
        <Route path="main" element={<MainScript />} />
        <Route path="/" element={<Navigate to="main" />} />
      </Routes>
    </RouterPageStyle>
  );
};

export default ScriptRouterComponent;
