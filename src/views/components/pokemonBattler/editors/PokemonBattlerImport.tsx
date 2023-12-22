import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { SelectGroup, SelectTrainer } from '@components/selects';
import { useProjectGroups, useProjectTrainers } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { Editor } from '@components/editor';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

import { useGroupPage, useTrainerPage } from '@utils/usePage';
import { StudioDropDown } from '@components/StudioDropDown';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';
import type { PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { assertUnreachable } from '@utils/assertUnreachable';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioGroup } from '@modelEntities/group';
import { StudioTrainer } from '@modelEntities/trainer';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';

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

const getFirstDbSymbol = (
  from: PokemonBattlerFrom,
  groups: ProjectData['groups'],
  trainers: ProjectData['trainers'],
  group: StudioGroup,
  trainer: StudioTrainer
) => {
  switch (from) {
    case 'group':
      return Object.entries(groups)
        .map(([value, data]) => ({ value, index: data.id }))
        .filter((d) => d.value !== group.dbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
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

type ImportInputProps = {
  from: 'group' | 'trainer';
  selectedEntity: string;
  onChange: (dbSymbol: string) => void;
  filterEntity: string;
};

const ImportInput: React.FC<ImportInputProps> = ({ from, selectedEntity, onChange, filterEntity }) => {
  const { t } = useTranslation(['database_trainers', 'database_groups']);
  const infoKey = from === 'group' ? 'database_groups:battler_import_info' : 'database_trainers:battler_import_info';
  const labelKey = from === 'group' ? 'database_groups:import_battler_from' : 'database_trainers:import_battler_from';
  const htmlForValue = from === 'group' ? 'group' : 'trainer';
  const SelectComponent = from === 'group' ? SelectGroup : SelectTrainer;

  return (
    <>
      <ImportInfo>{t(infoKey)}</ImportInfo>
      <InputWithTopLabelContainer>
        <Label htmlFor={htmlForValue}>{t(labelKey)}</Label>
        <SelectComponent dbSymbol={selectedEntity} onChange={onChange} filter={(dbSymbol) => dbSymbol !== filterEntity} noLabel />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor={htmlForValue}>{t(labelKey)}</Label>
        <SelectComponent dbSymbol={selectedEntity} onChange={onChange} filter={(dbSymbol) => dbSymbol !== filterEntity} noLabel />
      </InputWithTopLabelContainer>
    </>
  );
};

type PokemonBattlerImportProps = {
  closeDialog: () => void;
  from: PokemonBattlerFrom;
};

export const PokemonBattlerImport = forwardRef<EditorHandlingClose, PokemonBattlerImportProps>(({ closeDialog, from }, ref) => {
  const { projectDataValues: trainers } = useProjectTrainers();
  const { projectDataValues: groups } = useProjectGroups();
  const { trainer } = useTrainerPage();
  const { group } = useGroupPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const updateGroup = useUpdateGroup(group);
  const [selectedEntity, setSelectedEntity] = useState(getFirstDbSymbol(from, groups, trainers, group, trainer));
  const [override, setOverride] = useState<boolean>(false);
  const { t } = useTranslation(['database_trainers', 'database_groups']);

  const canImport = () => {
    if (from === 'group') return true;
    if (override) return true;

    const lengthPartyToImport = trainers[selectedEntity].party.length;
    const currentPartyLength = trainer.party.length;
    return currentPartyLength + lengthPartyToImport <= 6;
  };

  const onClickImport = () => {
    if (!canImport()) return;

    switch (from) {
      case 'group': {
        const encountersToImport = cloneEntity(groups[selectedEntity].encounters);
        if (override) {
          updateGroup({ encounters: encountersToImport });
        } else {
          const cloneEncounters = cloneEntity(group.encounters);
          cloneEncounters.push(...encountersToImport);
          updateGroup({ encounters: cloneEncounters });
        }
        break;
      }
      case 'trainer': {
        const partyToImport = cloneEntity(trainers[selectedEntity].party);
        if (override) {
          updateTrainer({ party: partyToImport });
        } else {
          const cloneParty = cloneEntity(trainer.party);
          cloneParty.push(...partyToImport);
          updateTrainer({ party: cloneParty });
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
    <Editor type={from} title={t('database_groups:import')}>
      <InputContainer size="m">
        <ImportInput
          from={from}
          selectedEntity={selectedEntity}
          onChange={(dbSymbol) => setSelectedEntity(dbSymbol)}
          filterEntity={from === 'group' ? group.dbSymbol : trainer.dbSymbol}
        />
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('database_groups:replace_battlers')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => setOverride(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {!canImport() && <ToolTip bottom="100%">{t('database_trainers:party_length_limit')}</ToolTip>}
            <PrimaryButton onClick={onClickImport} disabled={!canImport()}>
              {t('database_groups:to_import')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('database_groups:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
PokemonBattlerImport.displayName = 'PokemonBattlerImport';
