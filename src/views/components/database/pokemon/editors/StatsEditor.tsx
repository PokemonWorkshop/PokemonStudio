import { EditorWithCollapse } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { useCreaturePage } from '@utils/usePage';

import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';

export const StatEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const dataRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const canClose = () => Object.values(dataRefs.current).every((value) => value?.validity.valid);
  const onClose = () => {
    if (!canClose()) return;

    updateForm({
      baseHp: dataRefs.current.baseHp?.valueAsNumber || 0,
      baseAtk: dataRefs.current.baseAtk?.valueAsNumber || 0,
      baseDfe: dataRefs.current.baseDfe?.valueAsNumber || 0,
      baseAts: dataRefs.current.baseAts?.valueAsNumber || 0,
      baseDfs: dataRefs.current.baseDfs?.valueAsNumber || 0,
      baseSpd: dataRefs.current.baseSpd?.valueAsNumber || 0,
      evHp: dataRefs.current.evHp?.valueAsNumber || 0,
      evAtk: dataRefs.current.evAtk?.valueAsNumber || 0,
      evDfe: dataRefs.current.evDfe?.valueAsNumber || 0,
      evAts: dataRefs.current.evAts?.valueAsNumber || 0,
      evDfs: dataRefs.current.evDfs?.valueAsNumber || 0,
      evSpd: dataRefs.current.evSpd?.valueAsNumber || 0,
    });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <EditorWithCollapse type="edit" title={t('stats')}>
      <InputContainer size="s">
        <InputGroupCollapse title={t('base_stats')} collapseByDefault>
          <InputWithLeftLabelContainer>
            <Label htmlFor="hp">{t('hp')}</Label>
            <Input name="hp" type="number" min={0} max={255} step={1} defaultValue={form.baseHp} ref={(i) => (dataRefs.current.baseHp = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="atk">{t('attack')}</Label>
            <Input name="atk" type="number" min={0} max={255} step={1} defaultValue={form.baseAtk} ref={(i) => (dataRefs.current.baseAtk = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="dfe">{t('defense')}</Label>
            <Input name="dfe" type="number" min={0} max={255} step={1} defaultValue={form.baseDfe} ref={(i) => (dataRefs.current.baseDfe = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ats">{t('special_attack')}</Label>
            <Input name="ats" type="number" min={0} max={255} step={1} defaultValue={form.baseAts} ref={(i) => (dataRefs.current.baseAts = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="dfs">{t('special_defense')}</Label>
            <Input name="dfs" type="number" min={0} max={255} step={1} defaultValue={form.baseDfs} ref={(i) => (dataRefs.current.baseDfs = i)} />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="spd">{t('speed')}</Label>
            <Input name="spd" type="number" min={0} max={255} step={1} defaultValue={form.baseSpd} ref={(i) => (dataRefs.current.baseSpd = i)} />
          </InputWithLeftLabelContainer>
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
