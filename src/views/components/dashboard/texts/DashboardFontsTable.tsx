import React, { useMemo } from 'react';
import { StudioTextConfig, StudioTextTtfFileConfig } from '@modelEntities/config';
import { useTranslation } from 'react-i18next';
import { useConfigTexts } from '@hooks/useProjectConfig';
import { cloneEntity } from '@utils/cloneEntity';
import { DataDashboardFontsTable, DataDashboardFontGrid, TableEmpty } from './DashboardFontsTableStyle';
import { RenderDashboardFont } from './RenderDashboardFont';

type DashboardFontsTableProps = {
  texts: StudioTextConfig;
  isAlternative: boolean;
  onEdit: (index: number) => void;
};

export const DashboardFontsTable = ({ texts, isAlternative, onEdit }: DashboardFontsTableProps) => {
  const { setProjectConfigValues: setTexts } = useConfigTexts();
  const currentEditedTexts = useMemo(() => cloneEntity(texts), [texts]);
  const currentTtfFilesOrAltSizes = isAlternative ? currentEditedTexts.fonts.altSizes : currentEditedTexts.fonts.ttfFiles;
  const ttfFilesOrAltSizes = isAlternative ? texts.fonts.altSizes : texts.fonts.ttfFiles;
  const { t } = useTranslation('dashboard_texts');

  const onEditId = (index: number, id: number) => {
    currentTtfFilesOrAltSizes[index].id = id;
    currentTtfFilesOrAltSizes.sort((a, b) => a.id - b.id);
    setTexts(currentEditedTexts);
  };

  const onDelete = (index: number) => {
    currentTtfFilesOrAltSizes.splice(index, 1);
    setTexts(currentEditedTexts);
  };

  return ttfFilesOrAltSizes.length === 0 ? (
    <TableEmpty>{isAlternative ? t('no_alt_size') : t('no_font')}</TableEmpty>
  ) : (
    <DataDashboardFontsTable>
      <DataDashboardFontGrid gap="16px" className="header" isAlternative={isAlternative}>
        <span>ID</span>
        {!isAlternative && <span>{t('font_name')}</span>}
        <span className="size">{t('size')}</span>
        <span className="line-height">{t('line_height')}</span>
      </DataDashboardFontGrid>
      {ttfFilesOrAltSizes.map((ttfFileOrAltSize, index) => (
        <RenderDashboardFont
          index={index}
          key={index}
          fontData={
            isAlternative
              ? { font: ttfFileOrAltSize, isAlternative: true }
              : { font: ttfFileOrAltSize as StudioTextTtfFileConfig, isAlternative: false }
          }
          ttfFilesOrAltSizes={ttfFilesOrAltSizes}
          onEdit={() => onEdit(index)}
          onEditId={onEditId}
          onDelete={() => onDelete(index)}
        />
      ))}
    </DataDashboardFontsTable>
  );
};
