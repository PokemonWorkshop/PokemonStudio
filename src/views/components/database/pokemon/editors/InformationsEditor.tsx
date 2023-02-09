import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { SelectType } from '@components/selects';
import { CREATURE_DESCRIPTION_TEXT_ID, CREATURE_NAME_TEXT_ID, StudioCreature } from '@modelEntities/creature';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { useGetEntityDescriptionText, useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const OffsetInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

type InformationsEditorProps = {
  currentPokemon: StudioCreature;
  currentFormIndex: number;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const InformationsEditor: FunctionComponent<InformationsEditorProps> = ({
  currentPokemon,
  currentFormIndex,
  openTranslationEditor,
}: InformationsEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const getCreatureName = useGetEntityNameText();
  const getCreatureDescription = useGetEntityDescriptionText();
  const setText = useSetProjectText();
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <Editor type="edit" title={t('database_pokemon:information')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_pokemon:name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={getCreatureName(currentPokemon)} // TODO: Do it like ability names :<
              onChange={(event) => refreshUI(setText(CREATURE_NAME_TEXT_ID, currentPokemon.id, event.target.value))}
              placeholder={t('database_pokemon:example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="description">{t('database_pokemon:description')}</Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_description')}>
            <MultiLineInput
              name="description"
              value={getCreatureDescription(currentPokemon)}
              onChange={(event) => refreshUI(setText(CREATURE_DESCRIPTION_TEXT_ID, currentPokemon.id, event.target.value))}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type1">{t('database_pokemon:type1')}</Label>
          <SelectType dbSymbol={form.type1} onChange={(event) => refreshUI((form.type1 = event.value as DbSymbol))} noLabel rejected={[form.type2]} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type2">{t('database_pokemon:type2')}</Label>
          <SelectType
            dbSymbol={form.type2}
            onChange={(event) => refreshUI((form.type2 = event.value as DbSymbol))}
            noLabel
            rejected={[form.type1]}
            noneValue
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="offset">{t('database_pokemon:offset')}</Label>
            <Input
              type="number"
              name="offset"
              min="-999"
              max="999"
              value={isNaN(form.frontOffsetY) ? '' : form.frontOffsetY}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < -999 || newValue > 999) return event.preventDefault();
                refreshUI((form.frontOffsetY = newValue));
              }}
              onBlur={() => refreshUI((form.frontOffsetY = cleanNaNValue(form.frontOffsetY)))}
            />
          </InputWithLeftLabelContainer>
          <OffsetInfo>{t('database_pokemon:offset_info')}</OffsetInfo>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
