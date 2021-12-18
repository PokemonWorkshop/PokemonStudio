import React, { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import MoveModel, { MoveCategories } from '@modelEntities/move/Move.model';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useProjectMoves } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, wrongDbSymbol } from '@utils/dbSymbolCheck';
import { SelectType } from '@components/selects';

const moveCategoryEntries = (t: TFunction<('database_moves' | 'database_types')[]>) =>
  MoveCategories.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type MoveNewEditorProps = {
  onClose: () => void;
};

export const MoveNewEditor = ({ onClose }: MoveNewEditorProps) => {
  const { projectDataValues: moves, setProjectDataValues: setMove, bindProjectDataValue: bindMove } = useProjectMoves();
  const { t } = useTranslation(['database_moves', 'database_types']);
  const categoryOptions = useMemo(() => moveCategoryEntries(t), [t]);
  const refreshUI = useRefreshUI();
  const [newMove] = useState(bindMove(MoveModel.createMove(moves)));
  const [moveText] = useState({ name: '', descr: '' });

  const onClickNew = () => {
    newMove.setName(moveText.name);
    newMove.setDescr(moveText.descr);
    setMove({ [newMove.dbSymbol]: newMove }, { move: newMove.dbSymbol });
    onClose();
  };

  const checkDisabled = () => {
    return (
      moveText.name.length === 0 || newMove.dbSymbol.length === 0 || wrongDbSymbol(newMove.dbSymbol) || checkDbSymbolExist(moves, newMove.dbSymbol)
    );
  };

  return (
    <Editor type="creation" title={t('database_moves:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={moveText.name}
            onChange={(event) => refreshUI((moveText.name = event.target.value))}
            placeholder={t('database_moves:example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_moves:description')}</Label>
          <MultiLineInput
            id="descr"
            value={moveText.descr}
            onChange={(event) => refreshUI((moveText.descr = event.target.value))}
            placeholder={t('database_moves:example_description')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:type')}</Label>
          <SelectType dbSymbol={newMove.type} onChange={(event) => refreshUI((newMove.type = event.value))} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('database_moves:category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={(value) => refreshUI((newMove.category = value))}
            value={newMove.category}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="dbSymbol" required>
            {t('database_moves:symbol')}
          </Label>
          <Input
            type="text"
            name="dbSymbol"
            value={newMove.dbSymbol}
            onChange={(event) => refreshUI((newMove.dbSymbol = event.target.value))}
            error={wrongDbSymbol(newMove.dbSymbol) || checkDbSymbolExist(moves, newMove.dbSymbol)}
            placeholder={t('database_moves:example_db_symbol')}
          />
          {newMove.dbSymbol.length !== 0 && wrongDbSymbol(newMove.dbSymbol) && (
            <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>
          )}
          {newMove.dbSymbol.length !== 0 && checkDbSymbolExist(moves, newMove.dbSymbol) && (
            <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>
          )}
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('database_moves:fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('database_moves:create_move')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('database_moves:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
