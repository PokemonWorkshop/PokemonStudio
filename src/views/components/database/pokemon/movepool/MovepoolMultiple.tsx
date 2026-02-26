import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import styled from 'styled-components';
import { DarkButton, DeleteButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { getMoveKlass } from './MovepoolTable';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { MovepoolType } from '@pages/database/Pokemon.Movepool.page';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioLearnableMove } from '@modelEntities/creature';
import { SelectCustom } from '@components/SelectCustom';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';

type MovepoolMultipleProps = {
  type: MovepoolType;
  moves: SelectOption[];
  hasLevel?: boolean;
  closeDialog: () => void;
  setLastAddedMoves: React.Dispatch<React.SetStateAction<StudioLearnableMove[]>>;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const MovesToAdd = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primaryBase};
  ${({ theme }) => theme.fonts.normalRegular};
  user-select: none;

  ::after {
    content: '';
    flex: 1;
    border-top: 1px solid ${({ theme }) => theme.colors.dark18};
  }
`;

const MovesAdded = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  user-select: none;

  div {
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    -webkit-box-pack: justify;
    -webkit-box-align: center;
    align-items: center;

    &:hover {
      background-color: ${({ theme }) => theme.colors.dark18};
      border-radius: 8px;
    }

    div {
      background: transparent !important;
    }
  }

  span {
    color: ${({ theme }) => theme.colors.text400};
  }

  Input {
    width: 58px;
  }

  .delete-button {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .move {
    padding: 4px;
    ${({ theme }) => theme.fonts.normalRegular};

    span {
      color: ${({ theme }) => theme.colors.text100};
      width: 102px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }
  }

  &:hover .delete-button {
    opacity: 1;
  }
`;

export const MovepoolMultiple = forwardRef<EditorHandlingClose, MovepoolMultipleProps>(
  ({ type, moves, hasLevel, setLastAddedMoves, closeDialog }, ref) => {
    const { t } = useTranslation();
    const [selectedMoves, setSelectedMoves] = useState<DbSymbol[]>([]);
    const [selectValue, setSelectValue] = useState<SelectOption | undefined>(undefined);
    const selectRef = useRef<HTMLDivElement>(null);
    let shouldSave = false;
    const [moveLevels, setMoveLevels] = useState<Record<DbSymbol, number>>({});

    const filteredMoves = useMemo(() => {
      return moves.filter((move) => !selectedMoves.includes(move.value as DbSymbol));
    }, [moves, selectedMoves]);

    const onClose = () => {
      if (!shouldSave) return;
      if (selectedMoves.length === 0) return;
      const klass = type === 'level' ? 'LevelLearnableMove' : getMoveKlass(type);

      const newMoves: StudioLearnableMove[] = selectedMoves.map((move) => {
        const baseMove = {
          klass: klass as StudioLearnableMove['klass'],
          move,
        };

        if (type === 'level') {
          return { ...baseMove, level: moveLevels[move] || 1 } as StudioLearnableMove;
        }

        return baseMove as StudioLearnableMove;
      });

      setLastAddedMoves((prev) => [...prev, ...newMoves]);
    };

    useEditorHandlingClose(ref, onClose);

    const handleAddMoves = () => {
      if (selectedMoves.length === 0) return;
      shouldSave = true;
      closeDialog();
    };

    const handleCancel = () => {
      shouldSave = false;
      closeDialog();
    };

    const handleMoveChange = (selected: SelectOption) => {
      const moveValue = selected.value as DbSymbol;
      setSelectedMoves((prev) => {
        if (prev.includes(moveValue)) {
          // Si on retire le move, on retire aussi son level
          setMoveLevels((prevLevels) => {
            const newLevels = { ...prevLevels };
            delete newLevels[moveValue];
            return newLevels;
          });
          return prev.filter((m) => m !== moveValue);
        } else {
          // Si on ajoute le move, on initialise son level à 1
          if (hasLevel) {
            setMoveLevels((prevLevels) => ({
              ...prevLevels,
              [moveValue]: 1,
            }));
          }
          return [...prev, moveValue];
        }
      });
      setSelectValue(undefined);
    };

    const removeAddedOne = (moveValue: DbSymbol) => {
      setSelectedMoves((prev) => prev.filter((v) => v !== moveValue));
      setMoveLevels((prevLevels) => {
        const newLevels = { ...prevLevels };
        delete newLevels[moveValue];
        return newLevels;
      });
    };

    return (
      <Editor type="movepool" title={t('add_move_multiple')}>
        <InputContainer size="s">
          <InputWithTopLabelContainer>
            <Label htmlFor="moves">{t('moves_title')}</Label>
            <div ref={selectRef}>
              <SelectCustom options={filteredMoves} onChange={handleMoveChange} noOptionsText={t('no_move_found')} value={selectValue} />
            </div>

            {selectedMoves.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <MovesToAdd>
                  <span>{t('moves_to_add')}</span>
                </MovesToAdd>
                {selectedMoves.map((move) => (
                  <MovesAdded key={move}>
                    <div className="move">
                      <span>{moves.find((m) => m.value === move)?.label || move}</span>
                      <DeleteButtonOnlyIcon size="s" className="delete-button" onClick={() => removeAddedOne(move)} />
                    </div>
                    {hasLevel && (
                      <>
                        <span>nv.</span>
                        <Input
                          type="number"
                          min="1"
                          max="999"
                          value={moveLevels[move]}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!value)
                              setMoveLevels((prev) => ({
                                ...prev,
                                [move]: 0,
                              }));
                            if (value >= 1) {
                              setMoveLevels((prev) => ({
                                ...prev,
                                [move]: value,
                              }));
                            }
                          }}
                          onBlur={() => {
                            if (moveLevels[move] === 0) {
                              setMoveLevels((prev) => ({
                                ...prev,
                                [move]: 1,
                              }));
                            }
                          }}
                        />
                      </>
                    )}
                  </MovesAdded>
                ))}
              </div>
            )}
            <ButtonContainer>
              <PrimaryButton onClick={handleAddMoves} disabled={selectedMoves.length === 0}>
                {t('add_moves')}
              </PrimaryButton>
              <DarkButton onClick={handleCancel}>{t('cancel')}</DarkButton>
            </ButtonContainer>
          </InputWithTopLabelContainer>
        </InputContainer>
      </Editor>
    );
  },
);

MovepoolMultiple.displayName = 'MovepoolMultiple';
