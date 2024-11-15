import windowManager from '@src/backendTasks/windowManager';
import i18next from '@src/i18n';

export const backendTranslation = async (
  key: string,
  options: {
    ns?: string;
    replace?: unknown;
  }
) => {
  const { ns, replace } = options;
  const mainWindow = windowManager.getMainWindow();
  if (!mainWindow) return i18next.t(key, { ns, replace });

  const currentLanguage: string | undefined = await mainWindow.webContents.executeJavaScript('localStorage.getItem("i18nextLng")');
  if (!currentLanguage) return i18next.t(key, { ns, replace });

  return i18next.t(key, { ns, replace, lng: currentLanguage });
};
