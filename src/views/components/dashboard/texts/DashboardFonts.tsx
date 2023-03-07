import React, { useMemo } from 'react';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigTexts } from '@utils/useProjectConfig';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from '../DashboardEditor';
import { InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { DashboardFontsTable } from './DashboardFontsTable';
import { DashboardFontsTableWithButtons } from './DashboardFontsTableStyle';
import { DeleteButtonWithIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';

type DashboardFontsProps = {
  isAlternative: boolean;
  onNew: () => void;
  onEdit: (index: number) => void;
  onDeleteAll: () => void;
};

export const DashboardFonts = ({ isAlternative, onNew, onEdit, onDeleteAll }: DashboardFontsProps) => {
  const { projectConfigValues: texts, setProjectConfigValues: setTexts } = useConfigTexts();
  const currentEditedTexts = useMemo(() => cloneEntity(texts), [texts]);
  const { t } = useTranslation('dashboard_texts');

  return (
    <DashboardEditor editorTitle={t('texts')} title={isAlternative ? t('alt_sizes') : t('fonts')}>
      {!isAlternative && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="special-characters-number">{t('special_characters_number')}</Label>
          <Toggle
            checked={currentEditedTexts.fonts.isSupportsPokemonNumber}
            onChange={(event) => {
              currentEditedTexts.fonts.isSupportsPokemonNumber = event.target.checked;
              setTexts(currentEditedTexts);
            }}
          />
        </InputWithLeftLabelContainer>
      )}
      <DashboardFontsTableWithButtons>
        <DashboardFontsTable texts={texts} isAlternative={isAlternative} onEdit={onEdit} />
        <div className="table-buttons">
          <DeleteButtonWithIcon onClick={onDeleteAll}>{t('delete_all')}</DeleteButtonWithIcon>
          <SecondaryButtonWithPlusIcon onClick={onNew}>{isAlternative ? t('add_a_alt_size') : t('add_a_font')}</SecondaryButtonWithPlusIcon>
        </div>
      </DashboardFontsTableWithButtons>
    </DashboardEditor>
  );
};
