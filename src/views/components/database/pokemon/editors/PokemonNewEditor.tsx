import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { SelectType } from '@components/selects';
import { useProjectPokemon, useProjectDex } from '@utils/useProjectData';
import { createCreature } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { cloneEntity } from '@utils/cloneEntity';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type Props = {
  closeDialog: () => void;
  setEvolutionIndex: (index: number) => void;
};

export const PokemonNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, setEvolutionIndex }, ref) => {
  const { projectDataValues: creatures, setProjectDataValues: setCreature } = useProjectPokemon();
  const { projectDataValues: dex, setProjectDataValues: setDex } = useProjectDex();
  const { t } = useTranslation(['database_pokemon', 'database_moves']);
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We use a state because synchronizing dbSymbol is easier with a state
  const [type1, setType1] = useState<DbSymbol>('__undef__' as DbSymbol);
  const [type2, setType2] = useState<DbSymbol>('__undef__' as DbSymbol);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);
  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!dbSymbolRef.current || !name || !descriptionRef.current) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const newCreature = createCreature(creatures, dbSymbol, type1, type2);
    setText(CREATURE_NAME_TEXT_ID, newCreature.id, name);
    setText(CREATURE_DESCRIPTION_TEXT_ID, newCreature.id, descriptionRef.current.value);
    setCreature({ [dbSymbol]: newCreature }, { pokemon: { specie: dbSymbol, form: 0 } });
    const editedDex = cloneEntity(dex.national);
    editedDex.creatures.push({ dbSymbol, form: 0 });
    setDex({ [editedDex.dbSymbol]: editedDex });
    setEvolutionIndex(0);
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
  const checkDisabled = () => !name || !!dbSymbolErrorType || type1 === '__undef__';

  return (
    <Editor type="creation" title={t('database_pokemon:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_pokemon:name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('database_pokemon:example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_pokemon:description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('database_pokemon:example_description')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1" required>
            {t('database_pokemon:type1')}
          </Label>
          <SelectType dbSymbol={type1} onChange={(event) => setType1(event.value as DbSymbol)} rejected={[type2]} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType dbSymbol={type2} onChange={(event) => setType2(event.value as DbSymbol)} rejected={[type1]} noneValue noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('database_pokemon:example_db_symbol')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_pokemon:create_pokemon')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
PokemonNewEditor.displayName = 'PokemonNewEditor';
