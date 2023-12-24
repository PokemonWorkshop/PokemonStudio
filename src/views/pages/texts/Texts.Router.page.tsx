import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TextsPage } from '@pages/texts/Texts.page';
import { BaseTextsPage } from './BaseTexts.page';
import { TranslationPage } from './Translation.page';
import { RouterPageStyle } from '@components/pages';

const TextsRouterComponent = () => {
  return (
    <RouterPageStyle>
      <Routes>
        <Route path="" element={<BaseTextsPage />}>
          <Route path="" element={<TextsPage />} />
          <Route path="translation" element={<TranslationPage />} />
        </Route>
        <Route path="/" element={<Navigate to="" />} />
      </Routes>
    </RouterPageStyle>
  );
};

export default TextsRouterComponent;
