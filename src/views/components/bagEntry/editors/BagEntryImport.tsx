import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { SelectTrainer } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { Editor } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import { useTrainerPage } from '@hooks/usePage';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import type { BagEntryFrom } from './BagEntryEditorOverlay';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useProjectTrainers } from '@hooks/useProjectData';
import { StudioTrainer, reduceBagEntries } from '@modelEntities/trainer';
import { ProjectData } from '@src/GlobalStateProvider';

const ImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const getFirstDbSymbol = (from: BagEntryFrom, trainers: ProjectData['trainers'], trainer: StudioTrainer) => {
  switch (from) {
    case 'trainer':
      return Object.entries(trainers)
        .map(([value, data]) => ({ value, index: data.id }))
        .filter((d) => d.value !== trainer.dbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
    default:
      assertUnreachable(from);
  }
  return '__undef__';
};

type BagEntryImportProps = {
  closeDialog: () => void;
  from: BagEntryFrom;
};

export const BagEntryImport = forwardRef<EditorHandlingClose, BagEntryImportProps>(({ closeDialog, from }, ref) => {
  const { projectDataValues: trainers } = useProjectTrainers();
  const { trainer } = useTrainerPage();
  const { t } = useTranslation('database_trainers');
  const updateTrainer = useUpdateTrainer(trainer);
  const [selectedEntity, setSelectedEntity] = useState(getFirstDbSymbol(from, trainers, trainer));
  const overrideRef = useRef<HTMLInputElement>(null);

  const onClickImport = () => {
    switch (from) {
      case 'trainer': {
        const bagEntriesToImport = cloneEntity(trainers[selectedEntity].bagEntries);
        if (overrideRef.current?.checked) {
          updateTrainer({ bagEntries: bagEntriesToImport });
        } else {
          const newBagEntries = cloneEntity(trainer.bagEntries);
          newBagEntries.push(...bagEntriesToImport);
          updateTrainer({ bagEntries: reduceBagEntries(newBagEntries) });
        }
        break;
      }
      default:
        assertUnreachable(from);
    }
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type={from} title={t('import')}>
      <InputContainer size="m">
        <ImportInfo>{t('item_import_info')}</ImportInfo>
        <InputWithTopLabelContainer>
          <Label htmlFor="item">{t('import_item_from')}</Label>
          <SelectTrainer
            dbSymbol={selectedEntity}
            onChange={(dbSymbol) => setSelectedEntity(dbSymbol)}
            filter={(dbSymbol) => dbSymbol !== trainer.dbSymbol}
            noLabel
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_items')}</Label>
          <Toggle name="override" defaultChecked={false} ref={overrideRef} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickImport}>{t('to_import')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
BagEntryImport.displayName = 'BagEntryImport';
