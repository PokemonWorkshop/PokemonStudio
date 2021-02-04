import React from 'react';
import { MoveFrame } from '../../../components/database/move/MoveFrame';
import { MoveControlBar } from '../../../components/database/move/MoveControlBar';
import { MovePageStyle } from './Move.style';
import { DataDataBlock } from '../../../components/database/move/moveDataBlock/DataDataBlock';
import { ParametersDataBlock } from '../../../components/database/move/moveDataBlock/ParametersDataBlock';
import { CharacteristicsDataBlock } from '../../../components/database/move/moveDataBlock/CharacteristicsDataBlock';
import { StatusDataBlock } from '../../../components/database/move/moveDataBlock/StatusDataBlock';
import { StatisticsDataBlock } from '../../../components/database/move/moveDataBlock/StatisticsDataBlock';
import { PageContainerStyle } from '../PageContainerStyle';

export default function MovePage() {
  return (
    <MovePageStyle>
      <MoveControlBar />
      <PageContainerStyle>
        <div id="main-content">
          <MoveFrame />
          <div id="datablock-container">
            <DataDataBlock />
            <ParametersDataBlock />
            <CharacteristicsDataBlock />
            <StatusDataBlock />
            <StatisticsDataBlock />
          </div>
        </div>
      </PageContainerStyle>
    </MovePageStyle>
  );
}
