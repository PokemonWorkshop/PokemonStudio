import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TrainerModel, { AiCategories } from '@modelEntities/trainer/Trainer.model';
import {
  DataBlockContainer,
  DataFieldsetField,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import styled from 'styled-components';
import { useGlobalState } from '@src/GlobalStateProvider';
import { padStr } from '@utils/PadStr';
import IpcService from '@services/IPC/ipc.service';
import { fileExists } from '@utils/IPCUtils';
import { TrainerCategory } from '@components/categories';

type TrainerFrameProps = {
  trainer: TrainerModel;
  onClick: () => void;
};

const DataGridTrainer = styled(DataGrid)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: grid;
    grid-template-columns: minmax(min-content, 1024px);
    grid-auto-flow: row;
  }
`;

const TrainerInfoContainer = styled(DataInfoContainer)`
  gap: 20px;
`;

const TrainerSubInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
`;

type TrainerSpriteProps = {
  show: string;
};

const TrainerSpriteContainer = styled.div.attrs<TrainerSpriteProps>((props) => ({
  'data-show': props.show,
}))<TrainerSpriteProps>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: right;
  height: 160px;

  &[data-show='not-show'] {
    display: none;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    justify-content: left;
  }

  & .sprite-dp {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background-color: ${({ theme }) => theme.colors.dark15};
    border-radius: 4px;
  }

  & .sprite-big {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 284px;
    height: 160px;
    background-color: ${({ theme }) => theme.colors.dark15};
    border-radius: 4px;

    & img {
      image-rendering: auto;
    }
  }

  & img {
    object-fit: cover;
    image-rendering: pixelated;
    width: 100%;
    height: 100%;
  }
`;

export const TrainerFrame = ({ trainer, onClick }: TrainerFrameProps) => {
  const { t } = useTranslation('database_trainers');
  const [state] = useGlobalState();
  const ipc = useMemo(() => new IpcService(), []);
  const [spriteDp, setSpriteDp] = useState(false);
  const [spriteBig, setSpriteBig] = useState(false);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    const checkSpriteExists = async () => {
      if (!state.projectPath) return;

      const resultDp = await fileExists(ipc, trainer.sprite(state.projectPath));
      if ('error' in resultDp) return console.error(resultDp.error);

      const resultBig = await fileExists(ipc, trainer.spriteBig(state.projectPath));
      if ('error' in resultBig) return console.error(resultBig.error);

      setSpriteDp(resultDp.fileExists);
      setSpriteBig(resultBig.fileExists);
      setInitial(false);
    };
    checkSpriteExists();
  }, [ipc, state.projectPath, trainer]);

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGridTrainer columns="440px minmax(min-content, 1024px)" gap="24px">
        <TrainerInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {trainer.name()}
                <span className="data-id">#{padStr(trainer.id, 3)}</span>
              </h1>
            </DataInfoContainerHeaderTitle>
            {trainer.vsType === 2 && <TrainerCategory category="double">{t('vs_type2')}</TrainerCategory>}
          </DataInfoContainerHeader>
          <TrainerSubInfoContainer>
            <DataFieldsetField label={t('trainer_class')} data={trainer.trainerClassName()} />
            <DataFieldsetField label={t('ai_level')} data={t(AiCategories[trainer.ai])} />
            <DataFieldsetField label={t('money_given')} data={`${trainer.money()} P$`} />
          </TrainerSubInfoContainer>
        </TrainerInfoContainer>
        {trainer.battlers.length !== 0 && state.projectPath && (
          <TrainerSpriteContainer show={initial ? 'show' : !spriteBig && !spriteDp ? 'not-show' : 'show'}>
            {spriteBig && (
              <div className="sprite-big">
                <img src={trainer.spriteBig(state.projectPath)} />
              </div>
            )}
            {spriteDp && (
              <div className="sprite-dp">
                <img src={trainer.sprite(state.projectPath)} />
              </div>
            )}
          </TrainerSpriteContainer>
        )}
      </DataGridTrainer>
    </DataBlockContainer>
  );
};
