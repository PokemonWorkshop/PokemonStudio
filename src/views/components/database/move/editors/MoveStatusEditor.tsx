import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { MOVE_STATUS_LIST, StudioMoveStatus, StudioMoveStatusList } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';

type StudioMoveStatusListEditor = Exclude<StudioMoveStatusList, null> | '__undef__';

const moveStatusEntries = (t: TFunction<'database_moves'>) => [
  { value: '__undef__', label: t('none') },
  ...MOVE_STATUS_LIST.map((status) => ({
    value: status,
    label: t(status),
  })).sort((a, b) => a.label.localeCompare(b.label)),
];

const isValidStatus = (status: StudioMoveStatusListEditor, chance: number) => status !== '__undef__' || (chance > 0 && chance <= 100);

export const MoveStatusEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);
  const [status1, setStatus1] = useState<StudioMoveStatusListEditor>(move.moveStatus[0]?.status || '__undef__');
  const [status2, setStatus2] = useState<StudioMoveStatusListEditor>(move.moveStatus[1]?.status || '__undef__');
  const [status3, setStatus3] = useState<StudioMoveStatusListEditor>(move.moveStatus[2]?.status || '__undef__');
  const [chance1, setChance1] = useState<number>(move.moveStatus[0]?.luckRate || 0);
  const [chance2, setChance2] = useState<number>(move.moveStatus[1]?.luckRate || 0);
  const chance3Ref = useRef<HTMLInputElement>(null);

  const canClose = () => {
    if (isNaN(chance1) || chance1 < 0 || chance1 > 100) return false;
    if (isNaN(chance2) || chance2 < 0 || chance2 > 100) return false;
    if (!chance3Ref.current) return true;
    if (!chance3Ref.current.validity.valid || isNaN(chance3Ref.current.valueAsNumber)) return false;

    return true;
  };

  const onClose = () => {
    if (!canClose()) return;

    const moveStatus: StudioMoveStatus[] = [];
    if (status1 !== '__undef__' || chance1 !== 0) {
      moveStatus.push({ status: status1 !== '__undef__' ? status1 : null, luckRate: chance1 });
    } else {
      return updateMove({ moveStatus });
    }
    if (status2 !== '__undef__' || chance2 !== 0) {
      moveStatus.push({ status: status2 !== '__undef__' ? status2 : null, luckRate: chance2 });
    } else {
      return updateMove({ moveStatus });
    }
    if (status3 !== '__undef__' || (chance3Ref.current && chance3Ref.current.valueAsNumber !== 0)) {
      moveStatus.push({ status: status3 !== '__undef__' ? status3 : null, luckRate: chance3Ref.current?.valueAsNumber || 0 });
    } else {
      return updateMove({ moveStatus });
    }
    updateMove({ moveStatus });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('statuses')}>
      <InputContainer>
        <InputContainer size="s">
          <InputWithTopLabelContainer>
            <Label htmlFor="status-1">{t('status_1')}</Label>
            <SelectCustomSimple
              id="select-status-1"
              options={statusOptions}
              onChange={(value) => setStatus1(value as StudioMoveStatusListEditor)}
              value={status1}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="chance-1">{t('chance')}</Label>
            <PercentInput
              type="number"
              name="chance-1"
              min="0"
              max="100"
              value={isNaN(chance1) ? '' : chance1}
              onChange={(event) => setChance1(event.target.value === '' ? Number.NaN : Number(event.target.value))}
            />
          </InputWithLeftLabelContainer>
        </InputContainer>
        {isValidStatus(status1, chance1) && (
          <InputContainer size="s">
            <InputWithTopLabelContainer>
              <Label htmlFor="status-2">{t('status_2')}</Label>
              <SelectCustomSimple
                id="select-status-2"
                options={statusOptions}
                onChange={(value) => setStatus2(value as StudioMoveStatusListEditor)}
                value={status2}
                noTooltip
              />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="chance-2">{t('chance')}</Label>
              <PercentInput
                type="number"
                name="chance-2"
                min="0"
                max="100"
                value={isNaN(chance2) ? '' : chance2}
                onChange={(event) => setChance2(event.target.value === '' ? Number.NaN : Number(event.target.value))}
              />
            </InputWithLeftLabelContainer>
          </InputContainer>
        )}
        {isValidStatus(status1, chance1) && isValidStatus(status2, chance2) && (
          <InputContainer size="s">
            <InputWithTopLabelContainer>
              <Label htmlFor="status-3">{t('status_3')}</Label>
              <SelectCustomSimple
                id="select-status-3"
                options={statusOptions}
                onChange={(value) => setStatus3(value as StudioMoveStatusListEditor)}
                value={status3}
                noTooltip
              />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="chance-3">{t('chance')}</Label>
              <PercentInput type="number" name="chance-3" min="0" max="100" defaultValue={move.moveStatus[2]?.luckRate || 0} ref={chance3Ref} />
            </InputWithLeftLabelContainer>
          </InputContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
MoveStatusEditor.displayName = 'MoveStatusEditor';
