import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { Tag } from '@components/Tag';
import { useCreaturePage } from '@utils/usePage';
import styled from 'styled-components';

import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';

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

export const StatEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const dataRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [baseStats, setBaseStats] = useState({
    baseHp : form.baseHp,
    baseAtk : form.baseAtk,
    baseDfe : form.baseDfe,
    baseAts : form.baseAts,
    baseDfs : form.baseDfs,
    baseSpd : form.baseSpd,
  });

  const handleBaseStatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBaseStats({
      ...baseStats,
      [event.target.name]: Number(event.target.value),
    });
  };

  const canClose = () => {
    const evIsValid = Object.values(dataRefs.current).every((value) => value?.validity.valid);
  
    const baseStatsAreValid = Object.values(baseStats).every((stat) => stat >= 0 && stat <= 255);
  
    return evIsValid && baseStatsAreValid;
  };
  
  const onClose = () => {
    if (!canClose()) return;
    updateForm({
      ...baseStats,
      evHp: dataRefs.current.evHp?.valueAsNumber || 0,
      evAtk: dataRefs.current.evAtk?.valueAsNumber || 0,
      evDfe: dataRefs.current.evDfe?.valueAsNumber || 0,
      evAts: dataRefs.current.evAts?.valueAsNumber || 0,
      evDfs: dataRefs.current.evDfs?.valueAsNumber || 0,
      evSpd: dataRefs.current.evSpd?.valueAsNumber || 0,
    });
  };

  const calculateTotal = () => {
    return Object.values(baseStats).reduce((total, stat) => total + stat, 0);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t('stats')}>
      <InputContainer size="s">
        <InputGroupCollapse title={t('base_stats')} collapseByDefault>
          <InputWithLeftLabelContainer>
            <Label htmlFor="hp">{t('hp')}</Label>
            <Input name="baseHp" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseHp} onChange={handleBaseStatChange} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="atk">{t('attack')}</Label>
            <Input name="baseAtk" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseAtk} onChange={handleBaseStatChange} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="dfe">{t('defense')}</Label>
            <Input name="baseDfe" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseDfe} onChange={handleBaseStatChange} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ats">{t('special_attack')}</Label>
            <Input name="baseAts" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseAts} onChange={handleBaseStatChange} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="dfs">{t('special_defense')}</Label>
            <Input name="baseDfs" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseDfs} onChange={handleBaseStatChange} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="spd">{t('speed')}</Label>
            <Input name="baseSpd" type="number" min={0} max={255} step={1} defaultValue={baseStats.baseSpd} onChange={handleBaseStatChange}/>
          </InputWithLeftLabelContainer>
          <TotalBaseContainer>
            <span className="title">{t('total')}</span>
            <Tag>{`${calculateTotal()}`}</Tag>      
          </TotalBaseContainer>
        </InputGroupCollapse>
        <InputGroupCollapse title={t('effort_value_ev')} collapseByDefault>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_hp">{t('hp')}</Label>
            <Input name="ev_hp" type="number" min={0} max={255} step={1} defaultValue={form.evHp} ref={(i) => (dataRefs.current.evHp = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_atk">{t('attack')}</Label>
            <Input name="ev_atk" type="number" min={0} max={255} step={1} defaultValue={form.evAtk} ref={(i) => (dataRefs.current.evAtk = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_dfe">{t('defense')}</Label>
            <Input name="ev_dfe" type="number" min={0} max={255} step={1} defaultValue={form.evDfe} ref={(i) => (dataRefs.current.evDfe = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_ats">{t('special_attack')}</Label>
            <Input name="ev_ats" type="number" min={0} max={255} step={1} defaultValue={form.evAts} ref={(i) => (dataRefs.current.evAts = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_dfs">{t('special_defense')}</Label>
            <Input name="ev_dfs" type="number" min={0} max={255} step={1} defaultValue={form.evDfs} ref={(i) => (dataRefs.current.evDfs = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_spd">{t('speed')}</Label>
            <Input name="ev_spd" type="number" min={0} max={255} step={1} defaultValue={form.evSpd} ref={(i) => (dataRefs.current.evSpd = i)} />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
      </InputContainer>
    </EditorWithCollapse>
  );
});
StatEditor.displayName = 'StatEditor';
