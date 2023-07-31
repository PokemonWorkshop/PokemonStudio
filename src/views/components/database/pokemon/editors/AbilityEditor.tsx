import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectAbility } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';

const ABILITY_TEXT_KEYS = ['ability_1', 'ability_2', 'hidden_ability'] as const;

export const AbilityEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const [abilities, setAbilities] = useState([
    form.abilities[0] || ('__undef__' as DbSymbol),
    form.abilities[1] || ('__undef__' as DbSymbol),
    form.abilities[2] || ('__undef__' as DbSymbol),
  ]);

  const onClose = () => {
    updateForm({
      abilities: [...abilities],
    });
  };
  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('abilities')}>
      <InputContainer>
        {abilities.map((ability, index: number) => {
          const label = ABILITY_TEXT_KEYS[index];
          return (
            <InputWithTopLabelContainer key={index}>
              <Label htmlFor={label}>{t(label)}</Label>
              <SelectAbility
                dbSymbol={ability}
                onChange={(newDbSymbol) => {
                  abilities.splice(index, 1, newDbSymbol as DbSymbol);
                  setAbilities([...abilities]);
                }}
                noLabel
              />
            </InputWithTopLabelContainer>
          );
        })}
      </InputContainer>
    </Editor>
  );
});
AbilityEditor.displayName = 'AbilityEditor';
