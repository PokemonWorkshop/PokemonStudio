import { CompilationOptionsContainer } from './CompilationDialogStyle';
import { CompilationOption } from './CompilationOption';
import type { StudioOptionCompilation } from './CompilationDialogSchema';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import React, { useState } from 'react';
import { DarkButton } from '@components/buttons';

type CompilationOptionsProps = {
  defaults: Record<string, unknown>;
};

export const CompilationOptions = ({ defaults }: CompilationOptionsProps) => {
  const [isExpand, setIsExpand] = useState<boolean>(false);

  return (
    <CompilationOptionsContainer isExpand={isExpand}>
      <div className="header">
        <span>Options de compilation</span>
        <DarkButton className="expand-button" onClick={() => setIsExpand((expand) => !expand)}>
          {isExpand ? <UpIcon /> : <DownIcon />}
        </DarkButton>
      </div>
      <div className={isExpand ? 'options' : 'options-collapsed'}>
        {(['updateVisual', 'updateData', 'updateLibraries', 'updateAudio', 'updateBinaries'] as StudioOptionCompilation[]).map((option) => (
          <CompilationOption option={option} defaults={defaults} key={`option-${option}`} />
        ))}
      </div>
    </CompilationOptionsContainer>
  );
};
