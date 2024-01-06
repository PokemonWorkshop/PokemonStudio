import React, { forwardRef, useEffect, useMemo, useState } from 'react';
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

const isValidStatus = (status: StudioMoveStatusListEditor): status is Exclude<StudioMoveStatusList, null> => status !== '__undef__';
const isValidChance = (chance: number) => !isNaN(chance) && chance > 0 && chance <= 100;

export const MoveStatusEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);

  const [status1, setStatus1] = useState<StudioMoveStatusListEditor>(move.moveStatus[0]?.status ?? '__undef__');
  const [status2, setStatus2] = useState<StudioMoveStatusListEditor>(move.moveStatus[1]?.status ?? '__undef__');
  const [status3, setStatus3] = useState<StudioMoveStatusListEditor>(move.moveStatus[2]?.status ?? '__undef__');
  const [chance1, setChance1] = useState<number>(move.moveStatus[0]?.luckRate ?? 0);
  const [chance2, setChance2] = useState<number>(move.moveStatus[1]?.luckRate ?? 0);
  const [chance3, setChance3] = useState<number>(move.moveStatus[2]?.luckRate ?? 0);
  const [error, setError] = useState<string>('');

  const setStatusFunctions = [setStatus1, setStatus2, setStatus3];

  const setChancesFunctions = [setChance1, setChance2, setChance3];

  const isInitialStateStandard =
    (chance1 === 100 && chance2 === 0 && chance3 === 0) ||
    (chance1 === 50 && chance2 === 50 && chance3 === 0) ||
    (chance1 === 33 && chance2 === 33 && chance3 === 33);

  const canClose = () => {
    if (!isValidStatus(status1)) return true;

    if (isValidStatus(status1) && !isValidChance(chance1)) return false;
    if (isValidStatus(status2) && !isValidChance(chance2)) return false;
    if (isValidStatus(status3) && !isValidChance(chance3)) return false;
    if (chance1 + chance2 + chance3 > 100) return false;

    const validStatuses = [status1, status2, status3].filter((status) => isValidStatus(status));
    if (new Set(validStatuses).size !== validStatuses.length) return false;

    return true;
  };

  const onClose = () => {
    if (!canClose()) return;

    const statuses = [status1, status2, status3];
    const chances = [chance1, chance2, chance3];

    const moveStatus: StudioMoveStatus[] = [];
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      if (isValidStatus(status)) {
        moveStatus.push({ status, luckRate: chances[i] });
      } else {
        return updateMove({ moveStatus });
      }
    }
    updateMove({ moveStatus });
  };

  const resetStatusesFrom = (startIndex: number) => {
    setStatusFunctions.slice(startIndex).forEach((setStatus) => setStatus('__undef__'));
  };

  const setChances = (chances: Array<number>) => {
    setChancesFunctions.forEach((setChance, index) => setChance(chances[index]));
  };

  const handleStatusChange = (index: number, value: string) => {
    const newValue = value as StudioMoveStatusListEditor;
    setStatusFunctions[index](newValue);

    if (!isValidStatus(newValue)) {
      resetStatusesFrom(index);
      if (index === 1) setChances([100, 0, 0]);
      if (index === 2) setChances([50, 50, 0]);
    } else {
      switch (index) {
        case 0:
          setChances([100, 0, 0]);
          break;
        case 1:
          if (isInitialStateStandard) {
            setChances([50, 50, 0]);
          }
          break;
        case 2:
          if (isInitialStateStandard) {
            setChances([33, 33, 33]);
          }
          break;
      }
    }
  };

  const handleChancesChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newChance = event.target.value === '' ? Number.NaN : Number(event.target.value);
    setChancesFunctions[index](newChance);
  };

  useEffect(() => {
    const validStatuses = [status1, status2, status3].filter((status) => isValidStatus(status));
    if (new Set(validStatuses).size !== validStatuses.length) return setError(t('error_status'));

    if (isValidStatus(status1) && !isValidChance(chance1)) return setError(t('error_chances'));
    if (isValidStatus(status2) && !isValidChance(chance2)) return setError(t('error_chances'));
    if (isValidStatus(status3) && !isValidChance(chance3)) return setError(t('error_chances'));
    if (chance1 + chance2 + chance3 > 100) return setError(t('error_overflow'));

    setError('');
  }, [t, status1, status2, status3, chance1, chance2, chance3]);

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
              onChange={(value) => handleStatusChange(0, value)}
              value={status1}
              noTooltip
            />
          </InputWithTopLabelContainer>

          {isValidStatus(status1) && isValidStatus(status2) && (
            <InputWithLeftLabelContainer>
              <Label htmlFor="chance-1">{t('chance')}</Label>
              <PercentInput
                type="number"
                name="chance-1"
                min="0"
                max="100"
                value={isNaN(chance1) ? '' : chance1}
                onChange={(event) => handleChancesChange(0, event)}
              />
            </InputWithLeftLabelContainer>
          )}
        </InputContainer>
        {isValidStatus(status1, chance1) && (
          <InputContainer size="s">
            <InputWithTopLabelContainer>
              <Label htmlFor="status-2">{t('status_2')}</Label>
              <SelectCustomSimple
                id="select-status-2"
                options={statusOptions}
                onChange={(value) => handleStatusChange(1, value)}
                value={status2}
                noTooltip
              />
            </InputWithTopLabelContainer>

            {isValidStatus(status2) && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="chance-2">{t('chance')}</Label>
                <PercentInput
                  type="number"
                  name="chance-2"
                  min="0"
                  max="100"
                  value={isNaN(chance2) ? '' : chance2}
                  onChange={(event) => handleChancesChange(1, event)}
                />
              </InputWithLeftLabelContainer>
            )}
          </InputContainer>
        )}
        {isValidStatus(status1, chance1) && isValidStatus(status2, chance2) && (
          <InputContainer size="s">
            <InputWithTopLabelContainer>
              <Label htmlFor="status-3">{t('status_3')}</Label>
              <SelectCustomSimple
                id="select-status-3"
                options={statusOptions}
                onChange={(value) => handleStatusChange(2, value)}
                value={status3}
                noTooltip
              />
            </InputWithTopLabelContainer>

            {isValidStatus(status3) && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="chance-3">{t('chance')}</Label>
                <PercentInput
                  type="number"
                  name="chance-3"
                  min="0"
                  max="100"
                  value={isNaN(chance3) ? '' : chance3}
                  onChange={(event) => handleChancesChange(2, event)}
                />
              </InputWithLeftLabelContainer>
            )}

            {error && (
              <Label>
                <span>{error}</span>
              </Label>
            )}
          </InputContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
MoveStatusEditor.displayName = 'MoveStatusEditor';
