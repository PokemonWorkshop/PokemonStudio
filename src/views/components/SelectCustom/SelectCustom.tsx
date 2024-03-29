import { ListElement, SelectElement } from '@components/SelectCustom/SelectCustomStyle';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuListProps } from 'react-select';
import { SelectCustomProps, SelectOption } from './SelectCustomPropsInterface';

const getHeight = (length: number) => {
  if (length === 0) return '59px';
  else if (length >= 5) return '207px';

  return `${12 + length * 39}px`;
};

type RowRenderType = {
  key: string;
  index: number;
  style: never;
};

export const SelectCustom = ({ options, noOptionsText, defaultValue, onChange, value, error }: SelectCustomProps) => {
  const { t } = useTranslation('select');

  const MenuList = (props: MenuListProps) => {
    const width = 232;
    const rows = props.children as ReactNode[];
    const rowRenderer = ({ key, index, style }: RowRenderType) => (
      <div key={key} style={style}>
        {rows[index]}
      </div>
    );

    return !rows.length ? (
      <p className="no-option">{noOptionsText ? noOptionsText : t('no_option')}</p>
    ) : (
      <ListElement
        width={width}
        height={Math.min(39 * (rows.length || 0), 191)}
        rowHeight={39}
        rowCount={rows.length || 0}
        rowRenderer={rowRenderer}
      />
    );
  };

  return (
    <SelectElement
      classNamePrefix="react-select"
      options={options}
      onChange={(data) => onChange(data as SelectOption)}
      defaultValue={defaultValue || options[0]}
      components={{ MenuList }}
      value={value}
      height={getHeight(options.length)}
      error={error || false}
    />
  );
};
