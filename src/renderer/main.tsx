import { TitleBar } from '@components/titleBar/TitleBar';
import { ErrorPage } from '@pages/Error.page';
import App from '@src/App';
import theme from '@src/AppTheme';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from 'styled-components';

const TitleBarApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <TitleBar />
    </ThemeProvider>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Suspense fallback="loading...">
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <App />
    </ErrorBoundary>
  </Suspense>
);

const titlebar = createRoot(document.getElementById('titlebar') as HTMLElement);
titlebar.render(
  <Suspense fallback="loading...">
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <TitleBarApp />
    </ErrorBoundary>
  </Suspense>
);
