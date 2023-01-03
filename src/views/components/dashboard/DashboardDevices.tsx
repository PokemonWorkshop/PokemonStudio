import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { IconInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { useConfigDevices } from '@utils/useProjectConfig';
import styled from 'styled-components';
import { join } from '@utils/path';
import { cloneEntity } from '@utils/cloneEntity';

const MouseSkinInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const DashboardDevices = () => {
  const { t } = useTranslation('dashboard_devices');
  const [state] = useGlobalState();
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

  const iconPath = state.projectPath
    ? join(state.projectPath, `graphics/windowskins/${currentEditedDevices.mouseSkin}.png`)
    : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png';

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
        <InputContainer size="xs">
          <InputWithTopLabelContainer>
            <Label htmlFor={t('mouse_image')}>{t('mouse_image')}</Label>
            {currentEditedDevices.mouseSkin === null || currentEditedDevices.mouseSkin.length === 0 ? (
              <DropInput name={t('mouse_image')} extensions={['png']} onFileChoosen={onSkinChoosen} />
            ) : (
              <IconInput name={t('mouse_image')} extensions={['png']} iconPath={iconPath} onIconChoosen={onSkinChoosen} onIconClear={onSkinClear} />
            )}
          </InputWithTopLabelContainer>
          <MouseSkinInfoContainer>{t('info_mouse_image')}</MouseSkinInfoContainer>
        </InputContainer>
      )}
    </DashboardEditor>
  );
};
