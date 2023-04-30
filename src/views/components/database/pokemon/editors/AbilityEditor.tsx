import { Editor, useRefreshUI } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectAbility } from '@components/selects';
import { StudioCreature } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';

export const AbilityEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  // TODO: geneneralize this in the future
  const [ab1, setAb1] = useState(form.abilities[0] || ('__undef__' as DbSymbol));
  const [ab2, setAb2] = useState(form.abilities[1] || ('__undef__' as DbSymbol));
  const [ab3, setAb3] = useState(form.abilities[2] || ('__undef__' as DbSymbol));

  const onClose = () => {
    updateForm({
      abilities: [ab1, ab2, ab3],
    });
  };
  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="edit" title={t('abilities')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="ability_1">{t('ability_1')}</Label>
          <SelectAbility dbSymbol={ab1} onChange={(newDbSymbol) => setAb1(newDbSymbol as DbSymbol)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="ability_2">{t('ability_2')}</Label>
          <SelectAbility dbSymbol={ab2} onChange={(newDbSymbol) => setAb2(newDbSymbol as DbSymbol)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="hidden_ability">{t('hidden_ability')}</Label>
          <SelectAbility dbSymbol={ab3} onChange={(newDbSymbol) => setAb3(newDbSymbol as DbSymbol)} noLabel />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
});
AbilityEditor.displayName = 'AbilityEditor';
