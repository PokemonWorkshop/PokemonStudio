import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Editor } from '@components/editor';
import { StudioDropDown } from '@components/StudioDropDown';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { MultiLineInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { SelectGroup, SelectTrainer } from '@components/selects';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';

import { cloneEntity } from '@utils/cloneEntity';
import { convertShowdownInputChange } from '@utils/showdownUtils';
import { useProjectGroups, useProjectTrainers } from '@utils/useProjectData';
import { useGroupPage, useTrainerPage } from '@utils/usePage';

import { ProjectData } from '@src/GlobalStateProvider';
import { StudioGroup } from '@modelEntities/group';
import { StudioTrainer } from '@modelEntities/trainer';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

import type { PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { DbSymbol } from '@modelEntities/dbSymbol';

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

const ImportInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

type PokemonBattlerImportProps = {
  closeDialog: () => void;
  from: PokemonBattlerFrom;
};

const getFirstDbSymbol = (
  from: PokemonBattlerFrom,
  groups: ProjectData['groups'],
  trainers: ProjectData['trainers'],
  group: StudioGroup,
  trainer: StudioTrainer
) => {
  const getFirstSymbol = (entities: ProjectData['groups'] | ProjectData['trainers'], currentSymbol: DbSymbol) =>
    Object.entries(entities)
      .map(([value, data]) => ({ value, index: data.id }))
      .filter(({ value }) => value !== currentSymbol)
      .sort((a, b) => a.index - b.index)[0].value;

  return from === 'group' ? getFirstSymbol(groups, group.dbSymbol) : from === 'trainer' ? getFirstSymbol(trainers, trainer.dbSymbol) : '__undef__';
};

export const PokemonBattlerImport = forwardRef<EditorHandlingClose, PokemonBattlerImportProps>(({ closeDialog, from }, ref) => {
  const { t } = useTranslation(['database_trainers', 'database_groups']);

  const { projectDataValues: trainers } = useProjectTrainers();
  const { projectDataValues: groups } = useProjectGroups();
  const { trainer } = useTrainerPage();
  const { group } = useGroupPage();

  const updateTrainer = useUpdateTrainer(trainer);
  const updateGroup = useUpdateGroup(group);

  const [selectedEntity, setSelectedEntity] = useState(getFirstDbSymbol(from, groups, trainers, group, trainer));
  const [showdownEncounter, setShowdownEncounter] = useState<StudioGroupEncounter[]>([]);
  const [dropDownSelection, setDropDownSelection] = useState<string>('default');
  const [override, setOverride] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isGroup = from === 'group';
  const translationContext = isGroup ? 'database_groups' : 'database_trainers';
  const SelectComponent = isGroup ? SelectGroup : SelectTrainer;
  const getTranslation = useCallback((key: string) => t(`${translationContext}:${key}`), [t, translationContext]);

  const dropDownOptions = [
    { value: 'default', label: getTranslation('default_option_label') },
    { value: 'showdown', label: getTranslation('showdown_option_label') },
  ];

  useEffect(() => {
    if (dropDownSelection === 'default') return setError('');

    const partySizeError = getTranslation('party_length_limit');
    const exceedsPartyLimit = showdownEncounter.length + trainer.party.length > 6;

    if (override && error === partySizeError) return setError('');
    if (!override && exceedsPartyLimit) return setError(partySizeError);
  }, [dropDownSelection, override, error, t, showdownEncounter, trainer, getTranslation]);

  const handleChange: React.FocusEventHandler<HTMLTextAreaElement> = (event) => {
    const inputValue = event.currentTarget.value;
    if (!inputValue) return setError('');

    const convertedTeam = convertShowdownInputChange(inputValue);
    if (convertedTeam.length === 0) {
      setShowdownEncounter([]);
      return setError(getTranslation('error_message'));
    } else if (!isGroup && !override && convertedTeam.length + trainer.party.length > 6) {
      setError(getTranslation('party_length_limit'));
    } else {
      setError('');
    }

    setShowdownEncounter(convertedTeam);
  };

  const canImport = () => {
    if (isGroup || (override && dropDownSelection === 'default')) return true;

    if (dropDownSelection === 'showdown') {
      const isInputValid = showdownEncounter.length > 0;
      const exceedsPartyLimit = showdownEncounter.length + trainer.party.length > 6;

      return isInputValid && (!exceedsPartyLimit || override);
    }

    const lengthPartyToImport = trainers[selectedEntity].party.length;
    return trainer.party.length + lengthPartyToImport <= 6;
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

    if (dropDownSelection === 'showdown') {
      handleImport(from, showdownEncounter);
    } else {
      const entitiesToImport = isGroup ? cloneEntity(groups[selectedEntity].encounters) : cloneEntity(trainers[selectedEntity].party);
      handleImport(from, entitiesToImport);
    }

    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type={from} title={getTranslation('import')}>
      <InputContainer size="m">
        <ImportInfoContainer>
          <ImportInfo>{getTranslation('battler_import_info')}</ImportInfo>
          {dropDownSelection === 'showdown' && <ImportInfo>{getTranslation('battler_import_details')}</ImportInfo>}
        </ImportInfoContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor={from}>{getTranslation('import_battler')}</Label>
          <StudioDropDown value={dropDownSelection} options={dropDownOptions} onChange={(value) => setDropDownSelection(value)} />
        </InputWithTopLabelContainer>

        {dropDownSelection === 'default' && (
          <InputWithTopLabelContainer>
            <Label htmlFor={from}>{getTranslation('import_battler_from')}</Label>
            <SelectComponent
              dbSymbol={selectedEntity}
              onChange={(dbSymbol) => setSelectedEntity(dbSymbol)}
              filter={(dbSymbol) => dbSymbol !== (isGroup ? group.dbSymbol : trainer.dbSymbol)}
              noLabel
            />
          </InputWithTopLabelContainer>
        )}

        {dropDownSelection === 'showdown' && (
          <>
            <InputWithTopLabelContainer>
              <Label htmlFor={from}>{getTranslation('import_battler_showdown')}</Label>
              <MultiLineInput onChange={handleChange}></MultiLineInput>
            </InputWithTopLabelContainer>

            {error && (
              <Label>
                <span>{error}</span>
              </Label>
            )}
          </>
        )}

        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{getTranslation('replace_battlers')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => setOverride(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {dropDownSelection === 'default' && !canImport() && <ToolTip bottom="100%">{getTranslation('party_length_limit')}</ToolTip>}
            <PrimaryButton onClick={onClickImport} disabled={!canImport()}>
              {getTranslation('to_import')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{getTranslation('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});

PokemonBattlerImport.displayName = 'PokemonBattlerImport';
