import React from 'react';
import { useTranslation } from 'react-i18next';

type ErrorPageProps = {
  error: Error;
};

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const { t } = useTranslation();
  const isDev = window.api.isDev;

  return (
    <div style={{ color: 'white' }}>
      <h1>💥 Oups</h1>
      <p>Quelque chose s’est mal passé.</p>

      {error && (
        <details>
          <summary>Détails techniques</summary>
          <pre>{error.message}</pre>
        </details>
      )}

      <div>
        {!isDev && <button onClick={() => window.api.relaunch()}>Redémarrer l’application</button>}
        {isDev && (
          <div>
            <button onClick={() => window.location.reload()}>Recharger l’application</button>
            <p style={{ color: 'red' }}>Seul le front-end est rechargé</p>
          </div>
        )}
      </div>
    </div>
  );
};
