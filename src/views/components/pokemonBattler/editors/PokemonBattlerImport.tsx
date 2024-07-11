import React, { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Editor } from '@components/editor';
import { StudioDropDown } from '@components/StudioDropDown';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { MultiLineInput, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { SelectGroup, SelectTrainer } from '@components/selects';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';

import { cloneEntity } from '@utils/cloneEntity';
import { convertShowdownToStudio } from '@utils/showdownUtils';
import { useProjectGroups, useProjectTrainers } from '@hooks/useProjectData';
import { useGroupPage, useTrainerPage } from '@hooks/usePage';

import { ProjectData } from '@src/GlobalStateProvider';
import { StudioGroup } from '@modelEntities/group';
import { StudioTrainer } from '@modelEntities/trainer';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

import type { PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { TooltipWrapper } from '@ds/Tooltip';

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
  trainer: StudioTrainer | null
) => {
  const getFirstSymbol = (entities: ProjectData['groups'] | ProjectData['trainers'], currentSymbol: DbSymbol) => {
    if (!entities) return '__undef__';

    const entries = Object.entries(entities)
      .map(([value, data]) => ({ value, index: data.id }))
      .filter(({ value }) => value !== currentSymbol);
    if (entries.length === 0) return '__undef__';

    return entries.sort((a, b) => a.index - b.index)[0].value;
  };

  if (from === 'group') {
    return getFirstSymbol(groups, group.dbSymbol);
  } else if (from === 'trainer' && trainer) {
    return getFirstSymbol(trainers, trainer.dbSymbol);
  } else {
    return '__undef__';
  }
};

export const PokemonBattlerImport = forwardRef<EditorHandlingClose, PokemonBattlerImportProps>(({ closeDialog, from }, ref) => {
  const isGroup = from === 'group';
  const translationContext = isGroup ? 'database_groups' : 'database_trainers';
  const { t } = useTranslation(translationContext);
  const { t: tTrainer } = useTranslation('database_trainers');

  const { projectDataValues: trainers } = useProjectTrainers();
  const { projectDataValues: groups } = useProjectGroups();
  const { trainer } = useTrainerPage();
  const { group } = useGroupPage();

  const updateTrainer = useUpdateTrainer(trainer);
  const currentTrainer = useMemo(() => (trainer ? cloneEntity(trainer) : null), [trainer]);
  const updateGroup = useUpdateGroup(group);

  const [selectedEntity, setSelectedEntity] = useState(getFirstDbSymbol(from, groups, trainers, group, currentTrainer));
  const [showdownEncounter, setShowdownEncounter] = useState<StudioGroupEncounter[]>([]);
  const [dropDownSelection, setDropDownSelection] = useState<string>(selectedEntity !== '__undef__' ? 'default' : 'showdown');
  const [override, setOverride] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const SelectComponent = isGroup ? SelectGroup : SelectTrainer;

  const dropDownOptions = [
    { value: 'default', label: t('default_option_label') },
    { value: 'showdown', label: t('showdown_option_label') },
  ];

  const handleChange: React.FocusEventHandler<HTMLTextAreaElement> = (event) => {
    const inputValue = event.currentTarget.value;
    if (!inputValue) return setError('');

    const convertedTeam = convertShowdownToStudio(inputValue, from);
    if (convertedTeam.length === 0) {
      setShowdownEncounter([]);
      return setError(t('error_message'));
    } else if (!isGroup && !override && currentTrainer && convertedTeam.length + currentTrainer.party.length > 6) {
      setError(tTrainer('party_length_limit'));
    } else {
      setError('');
    }

    setShowdownEncounter(convertedTeam);
  };

  const handleImportTypeChange = (type: string) => {
    setDropDownSelection(type);
    if (type === 'default') {
      const lengthPartyToImport = trainers[selectedEntity].party.length;
      setError(override || (currentTrainer && currentTrainer.party.length + lengthPartyToImport <= 6) ? '' : tTrainer('party_length_limit'));
    } else {
      setError('');
      setShowdownEncounter([]);
    }
  };

  const canImport = (override: boolean) => {
    if (isGroup || (override && dropDownSelection === 'default')) return true;
    if (!currentTrainer) return false;

    if (dropDownSelection === 'showdown') {
      const isInputValid = showdownEncounter.length > 0;
      const exceedsPartyLimit = showdownEncounter.length + currentTrainer.party.length > 6;

      return isInputValid && (!exceedsPartyLimit || override);
    }

    const lengthPartyToImport = trainers[selectedEntity].party.length;
    return currentTrainer.party.length + lengthPartyToImport <= 6;
  };

  const handleSetOverride = (newValue: boolean) => {
    setOverride(newValue);
    if (newValue) {
      setError('');
    } else {
      setError(canImport(newValue) ? '' : tTrainer('party_length_limit'));
    }
  };

  const onClickImport = () => {
    if (!canImport(override)) return;

    const handleImport = (entityType: string, newEntities: StudioGroupEncounter[]) => {
      const updateFunction = entityType === 'group' ? updateGroup : updateTrainer;
      const entityKey = entityType === 'group' ? 'encounters' : 'party';
      const currentEntities = entityType === 'group' ? group.encounters : currentTrainer?.party;

      if (override) {
        updateFunction({ [entityKey]: newEntities });
      } else if (currentEntities) {
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
    <Editor type={from} title={t('import')}>
      <InputContainer size="m">
        <ImportInfoContainer>
          <ImportInfo>{t('battler_import_info')}</ImportInfo>
          {dropDownSelection === 'showdown' && <ImportInfo>{t('battler_import_details')}</ImportInfo>}
        </ImportInfoContainer>
        {selectedEntity !== '__undef__' && (
          <InputWithTopLabelContainer>
            <Label htmlFor={from}>{t('import_battler')}</Label>
            <StudioDropDown value={dropDownSelection} options={dropDownOptions} onChange={handleImportTypeChange} />
          </InputWithTopLabelContainer>
        )}

        {dropDownSelection === 'default' && (
          <InputWithTopLabelContainer>
            <Label htmlFor={from}>{t('import_battler_from')}</Label>
            <SelectComponent
              dbSymbol={selectedEntity}
              onChange={(dbSymbol) => setSelectedEntity(dbSymbol)}
              filter={(dbSymbol) => dbSymbol !== (isGroup ? group.dbSymbol : currentTrainer?.dbSymbol)}
              noLabel
            />
          </InputWithTopLabelContainer>
        )}

        {dropDownSelection === 'showdown' && (
          <>
            <InputWithTopLabelContainer>
              <Label htmlFor={from} required>
                {t('import_battler_showdown')}
              </Label>
              <MultiLineInput onChange={handleChange}></MultiLineInput>
              {error && (
                <Label>
                  <span>{error}</span>
                </Label>
              )}
            </InputWithTopLabelContainer>
          </>
        )}

        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('replace_battlers')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => handleSetOverride(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={dropDownSelection === 'default' && !canImport(override) ? tTrainer('party_length_limit') : undefined}>
            <PrimaryButton onClick={onClickImport} disabled={!canImport(override)}>
              {t('to_import')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});

PokemonBattlerImport.displayName = 'PokemonBattlerImport';
