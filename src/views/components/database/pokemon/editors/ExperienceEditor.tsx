import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';

const xpCurveEntries = (curves: string[]) =>
  curves.map((curveType, index) => ({ value: index.toString(), label: curveType })).sort((a, b) => a.label.localeCompare(b.label));

export const ExperienceEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const baseExpRef = useRef<HTMLInputElement>(null);
  const baseFriendshipRef = useRef<HTMLInputElement>(null);
  const [curveType, setCurveType] = useState(`${form.experienceType}`);
  const xpCurveOptions = useMemo(() => xpCurveEntries([t('fast'), t('normal'), t('slow'), t('parabolic'), t('erratic'), t('fluctuating')]), []);

  const canClose = () =>
    !!baseExpRef.current && baseExpRef.current.validity.valid && !!baseFriendshipRef.current && baseFriendshipRef.current.validity.valid;
  const onClose = () => {
    if (!baseFriendshipRef.current || !baseExpRef.current || !canClose()) return;

    const baseExp = isNaN(baseExpRef.current.valueAsNumber) ? form.baseExperience : baseExpRef.current.valueAsNumber;
    const baseLoyalty = isNaN(baseFriendshipRef.current.valueAsNumber) ? form.baseLoyalty : baseFriendshipRef.current.valueAsNumber;

    updateForm({
      experienceType: Number(curveType) as typeof form.experienceType,
      baseExperience: baseExp,
      baseLoyalty: baseLoyalty,
    });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('experience')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="curve-type">{t('curveType')}</Label>
          <SelectCustomSimple id="select-curve-type" options={xpCurveOptions} onChange={setCurveType} value={curveType} noTooltip />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="baseExperience">{t('base_experience')}</Label>
          <Input name="baseExperience" type="number" defaultValue={form.baseExperience} min={0} max={1000} ref={baseExpRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="baseLoyalty">{t('base_friendship')}</Label>
          <Input name="baseLoyalty" type="number" defaultValue={form.baseLoyalty} min={0} max={255} ref={baseFriendshipRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ExperienceEditor.displayName = 'ExperienceEditor';
