import React, { Suspense } from 'react';
import { render } from 'react-dom';
import App from './App';

import './i18n';

render(
  <Suspense fallback={null}>
    <App />
  </Suspense>,
  document.getElementById('root')
);
