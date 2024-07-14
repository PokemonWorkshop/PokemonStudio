import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { Tag } from '@components/Tag';
import { useCreaturePage } from '@hooks/usePage';
import styled from 'styled-components';
import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';

const TotalBaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;

  & span.title {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text400};
  }

  & ${Tag} {
    background-color: ${({ theme }) => theme.colors.dark20};
  }
`;

const getStat = (stat: string, defaults: Record<string, unknown>, formData: Record<string, unknown>) => {
  return Number(formData[stat] ? formData[stat] : defaults[stat] ?? 0);
};
const calculateTotal = (defaults: Record<string, unknown>, getRawFormData: () => Record<string, unknown>) => {
  const formData = getRawFormData();
  return ['baseHp', 'baseAtk', 'baseDfe', 'baseAts', 'baseDfs', 'baseSpd'].reduce((prev, stat) => prev + getStat(stat, defaults, formData), 0);
};

const STATS_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({
  ...{ baseHp: true, baseAtk: true, baseDfe: true, baseAts: true, baseDfs: true, baseSpd: true },
  ...{ evHp: true, evAtk: true, evDfe: true, evAts: true, evDfs: true, evSpd: true },
});

export const StatEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const totalRef = useRef<HTMLSpanElement>(null);
  const { canClose, getFormData, onInputTouched, defaults, getRawFormData, formRef } = useZodForm(STATS_EDITOR_SCHEMA, form);
  const { Input } = useInputAttrsWithLabel(STATS_EDITOR_SCHEMA, defaults);

  const handleBaseStatChange = () => {
    if (totalRef.current) totalRef.current.innerText = `${calculateTotal(defaults, getRawFormData)}`;
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateForm(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t('stats')}>
      <InputFormContainer ref={formRef} size="s">
        <InputGroupCollapse title={t('base_stats')} collapseByDefault>
          <Input name="baseHp" label={t('hp')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <Input name="baseAtk" label={t('attack')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <Input name="baseDfe" label={t('defense')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <Input name="baseAts" label={t('special_attack')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <Input name="baseDfs" label={t('special_defense')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <Input name="baseSpd" label={t('speed')} labelLeft onInput={onInputTouched} onChange={handleBaseStatChange} />
          <TotalBaseContainer>
            <span className="title">{t('total')}</span>
            <Tag ref={totalRef}>{`${calculateTotal(defaults, getRawFormData)}`}</Tag>
          </TotalBaseContainer>
        </InputGroupCollapse>
        <InputGroupCollapse title={t('effort_value_ev')} collapseByDefault>
          <Input name="evHp" label={t('hp')} labelLeft onInput={onInputTouched} />
          <Input name="evAtk" label={t('attack')} labelLeft onInput={onInputTouched} />
          <Input name="evDfe" label={t('defense')} labelLeft onInput={onInputTouched} />
          <Input name="evAts" label={t('special_attack')} labelLeft onInput={onInputTouched} />
          <Input name="evDfs" label={t('special_defense')} labelLeft onInput={onInputTouched} />
          <Input name="evSpd" label={t('speed')} labelLeft onInput={onInputTouched} />
        </InputGroupCollapse>
      </InputFormContainer>
    </EditorWithCollapse>
  );
});
StatEditor.displayName = 'StatEditor';
