import React, { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ProjectData,
  State,
  useGlobalState,
} from '../../../../GlobalStateProvider';
import IpcService from '../../../../services/IPC/ipc.service';
import ButtonProps from '../BaseButton/ButtonPropsInterface';
import { PrimaryButton } from '../PrimaryButton';
import { deserialize } from '../../../../utils/SerializationUtils';
import PSDKEntity from '../../../../models/entities/PSDKEntity';

type ProjectDialogReturnValue = State & { path: string };
export const LoadProjectButton: FunctionComponent<ButtonProps> = (
  props: ButtonProps
) => {
  const { text, disabled } = props;
  const IPC = new IpcService();
  const [state, setState] = useGlobalState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const history = useHistory();

  return (
    <PrimaryButton
      onClick={async () => {
        setIsDialogOpen(true);
        return IPC.send<ProjectDialogReturnValue>('project-loading')
          .then((data) => {
            const projectData: ProjectData = {
              items: {},
              moves: {},
              pokemon: {},
              quests: {},
              trainers: {},
              types: {},
              zones: {},
            };
            Object.keys(data.projectData).forEach((k) => {
              const entities: { [k: string]: PSDKEntity } = {};
              Object.keys(data.projectData[k]).forEach((id) => {
                const entity = deserialize(data.projectData[k][id]);
                if (entity) {
                  entities[id] = entity;
                }
              });
              projectData[k] = entities;
            });
            return setState((prev) => ({
              ...prev,
              projectData,
              projectPath: data.path,
            }));
          })
          .then(() => setIsDialogOpen(false))
          .catch(() => setIsDialogOpen(false))
          .finally(() => history.push('/dashboard'));
      }}
      disabled={isDialogOpen}
      text={text}
    />
  );
};
