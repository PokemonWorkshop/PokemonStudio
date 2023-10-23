import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TextsPage } from '@pages/texts/Texts.page';
import { BaseTextsPage } from './BaseTexts.page';
import { TranslationPage } from './Translation.page';

const TextsPageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

const TextsRouterComponent = () => {
  return (
    <TextsPageStyle>
      <Routes>
        <Route path="" element={<BaseTextsPage />}>
          <Route path="" element={<TextsPage />} />
          <Route path="translation" element={<TranslationPage />} />
        </Route>
        <Route path="/" element={<Navigate to="" />} />
      </Routes>
    </TextsPageStyle>
  );
};

export default TextsRouterComponent;
