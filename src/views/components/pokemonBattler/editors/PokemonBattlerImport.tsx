import React, { forwardRef, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { SelectGroup, SelectTrainer } from '@components/selects';
import { useProjectGroups, useProjectTrainers } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { cloneEntity } from '@utils/cloneEntity';
import { Editor } from '@components/editor';
import { MultiLineInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';

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
import { convertShowdownInputChange } from '@utils/showdownUtils';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

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

type PokemonBattlerImportProps = {
  closeDialog: () => void;
  from: PokemonBattlerFrom;
};

type ImportInputProps = {
  from: 'group' | 'trainer';
  selectedEntity: string;
  onChange: (dbSymbol: string) => void;
  filterEntity: string;
  setDropDownSelection: (selection: string) => void;
  dropDownSelection: string;
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

  const [dropDownSelection, setDropDownSelection] = useState('default');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canImport = () => {
    if (from === 'group') return true;
    if (override) return true;

    const lengthPartyToImport = trainers[selectedEntity].party.length;
    const currentPartyLength = trainer.party.length;
    return currentPartyLength + lengthPartyToImport <= 6;
  };

  const onClickImport = () => {
    if (!canImport()) return;

    const handleImport = (entityType: string, newEntities: StudioGroupEncounter[]) => {
      const updateFunction = entityType === 'group' ? updateGroup : updateTrainer;
      const entityKey = entityType === 'group' ? 'encounters' : 'party';
      const currentEntities = entityType === 'group' ? group.encounters : trainer.party;

      if (override) {
        updateFunction({ [entityKey]: newEntities });
      } else {
        const clonedEntities = cloneEntity(currentEntities);
        clonedEntities.push(...newEntities);
        updateFunction({ [entityKey]: clonedEntities });
      }
    };

    if (dropDownSelection === 'showdown' && inputRef.current) {
      const showdownEncounter = convertShowdownInputChange(inputRef.current.value);
      if (showdownEncounter.length === 0) {
        inputRef.current.focus();
        return;
      }
      handleImport(from, showdownEncounter);
    } else {
      const entitiesToImport = from === 'group' ? cloneEntity(groups[selectedEntity].encounters) : cloneEntity(trainers[selectedEntity].party);
      handleImport(from, entitiesToImport);
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
          setDropDownSelection={setDropDownSelection}
          dropDownSelection={dropDownSelection}
          ref={inputRef}
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

const ImportInput = forwardRef<HTMLTextAreaElement, ImportInputProps>(
  ({ from, selectedEntity, onChange, filterEntity, setDropDownSelection, dropDownSelection }, ref) => {
    const { t } = useTranslation(['database_trainers', 'database_groups']);
    const [error, setError] = useState('');

    const translationContext = from === 'group' ? 'database_groups' : 'database_trainers';
    const dropDownOptions = [
      { value: 'default', label: t(`${translationContext}:default_option_label`) },
      { value: 'showdown', label: t(`${translationContext}:showdown_option_label`) },
    ];

    const SelectComponent = from === 'group' ? SelectGroup : SelectTrainer;

    const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (event) => {
      const inputValue = event.currentTarget.value;
      const convertedTeam = convertShowdownInputChange(inputValue);

      console.log(convertedTeam);

      if (convertedTeam.length === 0) {
        setError(t(`${translationContext}:error_message`));
        event.target.focus();
      } else {
        setError('');
      }
    };

    return (
      <>
        <ImportInfo>{t(from === 'group' ? `${translationContext}:battler_import_info` : `${translationContext}:battler_import_info`)}</ImportInfo>
        <StudioDropDown value={dropDownSelection} options={dropDownOptions} onChange={(value) => setDropDownSelection(value)} />
        {dropDownSelection === 'default' && (
          <>
            <InputWithTopLabelContainer>
              <Label htmlFor={from}>
                {t(from === 'group' ? `${translationContext}:import_battler_from` : `${translationContext}:import_battler_from`)}
              </Label>
              <SelectComponent dbSymbol={selectedEntity} onChange={onChange} filter={(dbSymbol) => dbSymbol !== filterEntity} noLabel />
            </InputWithTopLabelContainer>
          </>
        )}
        {dropDownSelection === 'showdown' && <MultiLineInput ref={ref} onBlur={handleBlur}></MultiLineInput>}
        {error && (
          <Label>
            <span>{error}</span>
          </Label>
        )}
      </>
    );
  }
);

ImportInput.displayName = 'ImportInput';
