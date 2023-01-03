import React, { useMemo, useRef, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useProjectMoves } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { TextInputError } from '@components/inputs/Input';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { checkDbSymbolExist, generateDefaultDbSymbol, wrongDbSymbol } from '@utils/dbSymbolUtils';
import { SelectType } from '@components/selects';
import { MOVE_CATEGORIES, MOVE_DESCRIPTION_TEXT_ID, MOVE_NAME_TEXT_ID, StudioMoveCategory } from '@modelEntities/move';
import { createMove } from '@utils/entityCreation';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSetProjectText } from '@utils/ReadingProjectText';

const moveCategoryEntries = (t: TFunction<('database_moves' | 'database_types')[]>) =>
  MOVE_CATEGORIES.map((category) => ({ value: category, label: t(`database_types:${category}`) })).sort((a, b) => a.label.localeCompare(b.label));

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
  const { projectDataValues: moves, setProjectDataValues: setMove } = useProjectMoves();
  const { t } = useTranslation(['database_moves', 'database_types']);
  const categoryOptions = useMemo(() => moveCategoryEntries(t), [t]);
  const setText = useSetProjectText();
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [category, setCategory] = useState<StudioMoveCategory>('physical');
  const [type, setType] = useState('normal');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dbSymbolRef = useRef<HTMLInputElement>(null);
  const [dbSymbolErrorType, setDbSymbolErrorType] = useState<'value' | 'duplicate' | undefined>(undefined);

  const onClickNew = () => {
    if (!dbSymbolRef.current || !name || !descriptionRef.current) return;

    const dbSymbol = dbSymbolRef.current.value as DbSymbol;
    const newMove = createMove(dbSymbol, findFirstAvailableId(moves, 1), type as DbSymbol, category);
    setText(MOVE_NAME_TEXT_ID, newMove.id, name);
    setText(MOVE_DESCRIPTION_TEXT_ID, newMove.id, descriptionRef.current.value);
    setMove({ [dbSymbol]: newMove }, { move: dbSymbol });
    onClose();
  };

  const onChangeDbSymbol = (value: string) => {
    if (wrongDbSymbol(value)) {
      if (dbSymbolErrorType !== 'value') setDbSymbolErrorType('value');
    } else if (checkDbSymbolExist(moves, value)) {
      if (dbSymbolErrorType !== 'duplicate') setDbSymbolErrorType('duplicate');
    } else if (dbSymbolErrorType) {
      setDbSymbolErrorType(undefined);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dbSymbolRef.current) return;
    if (dbSymbolRef.current.value === '' || dbSymbolRef.current.value === generateDefaultDbSymbol(name)) {
      dbSymbolRef.current.value = generateDefaultDbSymbol(event.currentTarget.value);
      onChangeDbSymbol(dbSymbolRef.current.value);
    }
    setName(event.currentTarget.value);
  };

  const checkDisabled = () => {
    return !name || !dbSymbolRef.current || !!dbSymbolErrorType;
  };

  return (
    <Editor type="creation" title={t('database_moves:new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('database_moves:name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={onChangeName} placeholder={t('database_moves:example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="descr">{t('database_moves:description')}</Label>
          <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('database_moves:example_description')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="type">{t('database_moves:type')}</Label>
          <SelectType dbSymbol={type} onChange={(event) => setType(event.value)} noLabel />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('database_moves:category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={categoryOptions}
            onChange={setCategory as (v: string) => void}
            value={category}
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
            ref={dbSymbolRef}
            onChange={(e) => onChangeDbSymbol(e.currentTarget.value)}
            error={!!dbSymbolErrorType}
            placeholder={t('database_moves:example_db_symbol')}
          />
          {dbSymbolErrorType == 'value' && <TextInputError>{t('database_moves:incorrect_format')}</TextInputError>}
          {dbSymbolErrorType == 'duplicate' && <TextInputError>{t('database_moves:db_symbol_already_used')}</TextInputError>}
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
