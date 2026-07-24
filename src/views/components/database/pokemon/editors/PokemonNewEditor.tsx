import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { useProjectPokemon, useProjectDex } from '@hooks/useProjectData';
import { createCreature } from '@utils/entityCreation';
import { useSetProjectText, useGetProjectText } from '@utils/ReadingProjectText';
import {
  CREATURE_DESCRIPTION_TEXT_ID,
  CREATURE_FORM_NAME_TEXT_ID,
  CREATURE_FORM_VALIDATOR,
  CREATURE_NAME_TEXT_ID,
  CREATURE_SPECIE_TEXT_ID,
  CREATURE_FORM_DESCRIPTION_TEXT_ID,
} from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { cloneEntity } from '@utils/cloneEntity';
import { TooltipWrapper } from '@ds/Tooltip';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { TypeFields } from './InformationEditor/TypeFields';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import { importCreatureData } from '@utils/importEntityDataUtils';
import { playSound } from '@utils/sound';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const ImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ImportInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

type Props = {
  closeDialog: () => void;
  setEvolutionIndex: (index: number) => void;
};

const CREATURE_NEW_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ type1: true, type2: true });

export const PokemonNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, setEvolutionIndex }, ref) => {
  const { projectDataValues: creatures, setProjectDataValues: setCreature } = useProjectPokemon();
  const { projectDataValues: dex, setProjectDataValues: setDex } = useProjectDex();
  const { t } = useTranslation();
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We use a state because synchronizing dbSymbol is easier with a state
  const formNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  const typeOptions = useSelectOptions('types');
  const form = { type1: (typeOptions[0]?.value || '__undef__') as DbSymbol, type2: '__undef__' as DbSymbol };
  const { getFormData, defaults, formRef } = useZodForm(CREATURE_NEW_EDITOR_SCHEMA, form);
  useEditorHandlingClose(ref);
  const getText = useGetProjectText();
  const [selectedCreature, setSelectedCreature] = useState('__undef__');
  const [importing, setImporting] = useState(false);

  const onClickNew = () => {
    const result = getFormData();
    if (!dbSymbolRef.current || !name || !descriptionRef.current || !formNameRef.current || !result.success) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const { type1, type2 } = result.data;
    let newCreature = createCreature(creatures, dbSymbol, type1, type2);

    if (importing && selectedCreature !== '__undef__') {
      newCreature = importCreatureData(newCreature, creatures[selectedCreature], creatures);
      setText(CREATURE_SPECIE_TEXT_ID, newCreature.id, getText(CREATURE_SPECIE_TEXT_ID, creatures[selectedCreature].id));

      //Copy other forms texts
      let formCpt = 1;
      newCreature.forms.slice(1).forEach((form) => {
        setText(
          CREATURE_FORM_NAME_TEXT_ID,
          form.formTextId.name,
          getText(CREATURE_FORM_NAME_TEXT_ID, creatures[selectedCreature].forms[formCpt].formTextId.name)
        );
        setText(
          CREATURE_FORM_DESCRIPTION_TEXT_ID,
          form.formTextId.description,
          getText(CREATURE_FORM_DESCRIPTION_TEXT_ID, creatures[selectedCreature].forms[formCpt].formTextId.description)
        );
        formCpt++;
      });
    } else {
      setText(CREATURE_SPECIE_TEXT_ID, newCreature.id, '-');
    }

    setText(CREATURE_NAME_TEXT_ID, newCreature.id, name);
    setText(CREATURE_DESCRIPTION_TEXT_ID, newCreature.id, descriptionRef.current.value);
    setText(CREATURE_FORM_NAME_TEXT_ID, newCreature.forms[0].formTextId.name, formNameRef.current.value || name);

    setCreature({ [dbSymbol]: newCreature }, { pokemon: { specie: dbSymbol, form: 0 } });
    const editedDex = cloneEntity(dex.national);
    if (!editedDex.creatures.find(({ dbSymbol }) => dbSymbol === newCreature.dbSymbol)) {
      editedDex.creatures.push({ dbSymbol, form: 0 });
      setDex({ [editedDex.dbSymbol]: editedDex });
    }
    setEvolutionIndex(0);
    playSound('ready');
    closeDialog();
  };

  /**
   * Handle the error validation of the dbSymbol when the dbSymbol is changed
   */
  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(creatures, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  /**
   * Handle the change of name (also update dbSymbol if none were specified)
   */
  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;

    // Update the dbSymbol if it was equal to the default dbSymbol or not set
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  /**
   * Check if the entity cannot be created because of any validation error
   */
  const isDisabled = !name || !!dbSymbolErrorType;

  return (
    <Editor type="creation" title={t('new_creature')}>
      <InputFormContainer ref={formRef}>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <Input value={name} onChange={onChangeName} placeholder={t('example_creature')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('description')}</Label>
          <MultiLineInput ref={descriptionRef} placeholder={t('example_description_creature')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label>{t('form_name')}</Label>
          <Input ref={formNameRef} placeholder={t('example_form_name')} />
        </InputWithTopLabelContainer>
        <TypeFields form={form} defaults={defaults} />
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('example_db_symbol_creature')}
          />
          {dbSymbolErrorType === 'value' && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {dbSymbolErrorType === 'duplicate' && <TextInputError>{t('db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <InputGroupCollapse title={t('other_data')} gap="16px" onClick={() => setImporting(!importing)}>
          <ImportInfoContainer>
            <ImportInfo>{t('creature_import_info')}</ImportInfo>
          </ImportInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-creature-to-import">{t('import_data_from')}</Label>
            <SelectPokemon
              dbSymbol={selectedCreature}
              onChange={(dbSymbol) => setSelectedCreature(dbSymbol)}
              noLabel
              undefValueOption={t('none_option')}
            />
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={isDisabled ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={isDisabled}>
              {t('create_creature')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
PokemonNewEditor.displayName = 'PokemonNewEditor';
