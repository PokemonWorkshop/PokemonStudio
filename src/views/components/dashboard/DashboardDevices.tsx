import React, { useMemo } from 'react';
import { IconInput, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { useConfigDevices } from '@utils/useProjectConfig';
import { cloneEntity } from '@utils/cloneEntity';

export const DashboardDevices = () => {
  const { t } = useTranslation('dashboard_devices');
  const { projectConfigValues: devices, setProjectConfigValues: setDevices } = useConfigDevices();
  const currentEditedDevices = useMemo(() => cloneEntity(devices), [devices]);

  const onSkinChoosen = (skinPath: string) => {
    currentEditedDevices.mouseSkin = skinPath.replaceAll('\\', '/').split('/').pop()?.split('.').shift() || null;
    setDevices(currentEditedDevices);
  };

  const onSkinClear = () => {
    currentEditedDevices.mouseSkin = null;
    setDevices(currentEditedDevices);
  };

  return (
    <DashboardEditor editorTitle={t('devices')} title={t('mouse')}>
      <InputWithLeftLabelContainer>
        <Label htmlFor="use_mouse">{t('use_mouse')}</Label>
        <Toggle
          name="use_mouse"
          checked={!currentEditedDevices.isMouseDisabled}
          onChange={(event) => {
            currentEditedDevices.isMouseDisabled = !event.target.checked;
            setDevices(currentEditedDevices);
          }}
        />
      </InputWithLeftLabelContainer>
      {!currentEditedDevices.isMouseDisabled && (
        <InputWithTopLabelContainer>
          <Label htmlFor={t('mouse_image')}>{t('mouse_image')}</Label>
          {currentEditedDevices.mouseSkin === null || currentEditedDevices.mouseSkin.length === 0 ? (
            <DropInput destFolderToCopy="graphics/windowskins" name={t('mouse_image')} extensions={['png']} onFileChoosen={onSkinChoosen} />
          ) : (
            <IconInput
              name={t('mouse_image')}
              extensions={['png']}
              iconPathInProject={`graphics/windowskins/${currentEditedDevices.mouseSkin}.png`}
              destFolderToCopy="graphics/windowskins"
              onIconChoosen={onSkinChoosen}
              onIconClear={onSkinClear}
            />
          )}
        </InputWithTopLabelContainer>
      )}
    </DashboardEditor>
  );
};
