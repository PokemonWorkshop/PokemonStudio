import React, { forwardRef, useState, useRef, useEffect } from 'react';
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

const ImportInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

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
  override: boolean;
  setShowdownEncounter: (encounters: StudioGroupEncounter[]) => void;
};

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
  const [showdownEncounter, setShowdownEncounter] = useState<StudioGroupEncounter[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canImport = () => {
    if (from === 'group') return true;
    if (override) return true;
    if (dropDownSelection === 'showdown') {
      if (!inputRef.current) return false;

      if (showdownEncounter.length === 0) return false;
      if (!override && showdownEncounter.length + trainer.party.length > 6) return false;

      return true;
    }

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

    if (dropDownSelection === 'showdown') {
      if (!inputRef.current) return;

      const showdownEncounter = convertShowdownInputChange(inputRef.current.value);
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
          override={override}
          setShowdownEncounter={setShowdownEncounter}
          ref={inputRef}
        />
        <InputWithLeftLabelContainer>
          <Label htmlFor="override">{t('database_groups:replace_battlers')}</Label>
          <Toggle name="override" checked={override} onChange={(event) => setOverride(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {dropDownSelection === 'default' && !canImport() && <ToolTip bottom="100%">{t('database_trainers:party_length_limit')}</ToolTip>}
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
  ({ from, selectedEntity, onChange, filterEntity, setDropDownSelection, dropDownSelection, setShowdownEncounter, override }, ref) => {
    const { t } = useTranslation(['database_trainers', 'database_groups']);
    const { trainer } = useTrainerPage();
    const [error, setError] = useState('');

    const translationContext = from === 'group' ? 'database_groups' : 'database_trainers';
    const dropDownOptions = [
      { value: 'default', label: t(`${translationContext}:default_option_label`) },
      { value: 'showdown', label: t(`${translationContext}:showdown_option_label`) },
    ];

    const SelectComponent = from === 'group' ? SelectGroup : SelectTrainer;

    // Prevent error from being displayed when dropDownSelection === 'default'.
    useEffect(() => {
      return setError('');
    }, [dropDownSelection]);

    // Manages display of team size limit error based on override
    useEffect(() => {
      if (override && error === t('database_trainers:party_length_limit')) return setError('');
    }, [override, error, t]);

    const handleChange: React.FocusEventHandler<HTMLTextAreaElement> = (event) => {
      const inputValue = event.currentTarget.value;
      if (!inputValue) return setError('');

      const convertedTeam = convertShowdownInputChange(inputValue);
      if (convertedTeam.length === 0) {
        return setError(t(`${translationContext}:error_message`));
      } else if (from === 'trainer' && !override && convertedTeam.length + trainer.party.length > 6) {
        return setError(t('database_trainers:party_length_limit'));
      } else {
        setError('');
      }

      setShowdownEncounter(convertedTeam);
    };

    return (
      <>
        <ImportInfoContainer>
          <ImportInfo>{t(from === 'group' ? `${translationContext}:battler_import_info` : `${translationContext}:battler_import_info`)}</ImportInfo>
          {dropDownSelection === 'showdown' && (
            <ImportInfo>
              {t(from === 'group' ? `${translationContext}:battler_import_details` : `${translationContext}:battler_import_details`)}
            </ImportInfo>
          )}
        </ImportInfoContainer>

        <InputWithTopLabelContainer>
          <Label htmlFor={from}>{t(from === 'group' ? `${translationContext}:import_battler` : `${translationContext}:import_battler`)}</Label>
          <StudioDropDown value={dropDownSelection} options={dropDownOptions} onChange={(value) => setDropDownSelection(value)} />
        </InputWithTopLabelContainer>

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

        {dropDownSelection === 'showdown' && (
          <InputWithTopLabelContainer>
            <Label htmlFor={from}>
              {t(from === 'group' ? `${translationContext}:import_battler_showdown` : `${translationContext}:import_battler_showdown`)}
            </Label>
            <MultiLineInput ref={ref} onChange={handleChange}></MultiLineInput>
          </InputWithTopLabelContainer>
        )}

        {dropDownSelection === 'showdown' && error && (
          <Label>
            <span>{error}</span>
          </Label>
        )}
      </>
    );
  }
);

ImportInput.displayName = 'ImportInput';
