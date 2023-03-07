import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DataDashboardFontGrid } from './DashboardFontsTableStyle';
import theme from '@src/AppTheme';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import { StudioTextTtfFileConfig, StudioTextAltSizeConfig } from '@modelEntities/config';
import { InputTable } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type RenderDashboardFontContainerProps = {
  isAlternative: boolean;
};

const RenderDashboardFontContainer = styled(DataDashboardFontGrid).attrs<RenderDashboardFontContainerProps>((props) => ({
  'data-is-alternative': props.isAlternative ? true : undefined,
}))<RenderDashboardFontContainerProps>`
  box-sizing: border-box;
  height: 40px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;

  & .buttons {
    display: none;
  }

  &:hover {
    & .buttons {
      display: flex;
      gap: 4px;
      justify-content: end;
      align-items: center;
    }
  }

  ${EditButtonOnlyIconContainer} {
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }

  @media ${theme.breakpoints.dataBox422} {
    & .line-height {
      display: none;
    }

    &[data-is-alternative] {
      & .line-height {
        display: block;
      }
    }
  }
`;

const searchDuplicateId = (currentId: number, ttfFilesOrAltSizes: StudioTextAltSizeConfig[]) => {
  const result = ttfFilesOrAltSizes
    .map(({ id }) => id)
    .reduce((previousValue, id) => {
      if (id === currentId) return previousValue + 1;
      return previousValue;
    }, 0);
  return result > 1;
};

type FontData = { font: StudioTextTtfFileConfig; isAlternative: false } | { font: StudioTextAltSizeConfig; isAlternative: true };

type RenderDashboardFontProps = {
  index: number;
  fontData: FontData;
  ttfFilesOrAltSizes: StudioTextAltSizeConfig[];
  onEdit: () => void;
  onEditId: (index: number, id: number) => void;
  onDelete: () => void;
};

export const RenderDashboardFont = ({ index, fontData, ttfFilesOrAltSizes, onEdit, onEditId, onDelete }: RenderDashboardFontProps) => {
  const font = fontData.font;
  const [id, setId] = useState<number>(font.id);
  const isDuplicateId = useMemo(() => searchDuplicateId(id, ttfFilesOrAltSizes), [id, ttfFilesOrAltSizes]);

  useEffect(() => {
    setId(font.id);
  }, [font]);

  return (
    <RenderDashboardFontContainer isAlternative={fontData.isAlternative}>
      <InputTable
        min="0"
        max="999"
        value={isNaN(id) ? '' : id}
        onChange={(event) => {
          const newValue = parseInt(event.target.value);
          if (newValue < 0 || newValue > 999) return event.preventDefault();
          setId(newValue);
        }}
        onBlur={() => {
          const value = cleanNaNValue(id, font.id);
          setId(value);
          onEditId(index, value);
        }}
        error={isDuplicateId}
      />
      {!fontData.isAlternative && <span>{fontData.font.name}</span>}
      <span className="size">{font.size}</span>
      <span className="line-height">{font.lineHeight}</span>
      <div className="buttons">
        <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onEdit} />
        <DeleteButtonOnlyIcon size="s" onClick={onDelete} />
      </div>
    </RenderDashboardFontContainer>
  );
};
