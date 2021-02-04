import React, { FunctionComponent } from 'react';
import { Type } from '../../../Type';
import { MoveFrameStyle } from './MoveFrameStyle';

export const MoveFrame: FunctionComponent = () => {
  return (
    <MoveFrameStyle>
      <div id="move-info">
        <div id="info-head">
          <h1 id="name">Écras’Face</h1>
          <div id="info-types">
            <Type type="normal" />
            <Type type="physical" />
          </div>
        </div>
        <p id="info-description">
          Écrase l’ennemi avec les pattes avant ou la queue, par exemple.
        </p>
      </div>
    </MoveFrameStyle>
  );
};
