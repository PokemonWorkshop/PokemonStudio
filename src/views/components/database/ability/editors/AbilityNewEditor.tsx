import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, wrongDbSymbol } from '@utils/dbSymbolCheck';
import { useProjectAbilities } from '@utils/useProjectData';
import AbilityModel from '@modelEntities/ability/Ability.model';

type AbilityNewEditorProps = {
  onClose: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

export const AbilityNewEditor = ({ onClose }: AbilityNewEditorProps) => {
  const { projectDataValues: abilities, setProjectDataValues: setAbility, bindProjectDataValue: bindAbility } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const refreshUI = useRefreshUI();
  const [newAbility] = useState(bindAbility(AbilityModel.createAbility(abilities)));
  const [abilityText] = useState({ name: '', descr: '' });

  const onClickNew = () => {
    newAbility.setName(abilityText.name);
    newAbility.setDescr(abilityText.descr);
    setAbility({ [newAbility.dbSymbol]: newAbility }, { ability: newAbility.dbSymbol });
    onClose();
  };

  const checkDisabled = () => {
    return (
      abilityText.name.length === 0 ||
      newAbility.dbSymbol.length === 0 ||
      wrongDbSymbol(newAbility.dbSymbol) ||
      checkDbSymbolExist(abilities, newAbility.dbSymbol)
    );
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={abilityText.name}
            onChange={(event) => refreshUI((abilityText.name = event.target.value))}
            placeholder={t('example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('description')}</Label>
          <MultiLineInput
            id="descr"
            value={abilityText.descr}
            onChange={(event) => refreshUI((abilityText.descr = event.target.value))}
            placeholder={t('example_description')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            value={newAbility.dbSymbol}
            onChange={(event) => refreshUI((newAbility.dbSymbol = event.target.value))}
            error={wrongDbSymbol(newAbility.dbSymbol) || checkDbSymbolExist(abilities, newAbility.dbSymbol)}
            placeholder={t('example_db_symbol')}
          />
          {newAbility.dbSymbol.length !== 0 && wrongDbSymbol(newAbility.dbSymbol) && <TextInputError>{t('incorrect_format')}</TextInputError>}
          {newAbility.dbSymbol.length !== 0 && checkDbSymbolExist(abilities, newAbility.dbSymbol) && (
            <TextInputError>{t('db_symbol_already_used')}</TextInputError>
          )}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_ability')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
