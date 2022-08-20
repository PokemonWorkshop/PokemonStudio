import React, { useMemo } from 'react';
import { useGlobalState } from '@src/GlobalStateProvider';
import { IconInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { useConfigDevices } from '@utils/useProjectConfig';
import styled from 'styled-components';

const MouseSkinInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const DashboardDevices = () => {
  const { t } = useTranslation('dashboard_devices');
  const [state] = useGlobalState();
  const { projectConfigValues: devices, setProjectConfigValues: setDevices } = useConfigDevices();
  const currentEditedDevices = useMemo(() => devices.clone(), [devices]);

  const onSkinChoosen = (skinPath: string) => {
    currentEditedDevices.mouseSkin = skinPath.replaceAll('\\', '/').split('/').pop()?.split('.').shift();
    setDevices(currentEditedDevices);
  };

  const onSkinClear = () => {
    currentEditedDevices.mouseSkin = '';
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
        <InputContainer size="xs">
          <InputWithTopLabelContainer>
            <Label htmlFor={t('mouse_image')}>{t('mouse_image')}</Label>
            {currentEditedDevices.mouseSkin === undefined || currentEditedDevices.mouseSkin.length === 0 ? (
              <DropInput name={t('mouse_image')} extensions={['png']} onFileChoosen={onSkinChoosen} />
            ) : (
              <IconInput
                name={t('mouse_image')}
                extensions={['png']}
                iconPath={
                  state.projectPath ? currentEditedDevices.mouseSkinUrl(state.projectPath) : 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'
                }
                onIconChoosen={onSkinChoosen}
                onIconClear={onSkinClear}
              />
            )}
          </InputWithTopLabelContainer>
          <MouseSkinInfoContainer>{t('info_mouse_image')}</MouseSkinInfoContainer>
        </InputContainer>
      )}
    </DashboardEditor>
  );
};
