import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TypeTableContainer, TypeTableHead, TypeTableRow, TypeTableBodyContainer, TableTypeContainer } from './table';
import { TitleContainer } from '@components/editor/DataBlockEditorStyle';
import { useProjectTypes } from '@utils/useProjectData';
import TypeModel from '@modelEntities/type/Type.model';

export const TypeTable = () => {
  const { projectDataValues: types, setProjectDataValues: setType } = useProjectTypes();
  const allTypes = useMemo(() => Object.values(types).sort((a, b) => a.id - b.id), [types]);
  const [hoveredDefensiveType, setHoveredDefensiveType] = useState('__undef__');
  const { t } = useTranslation('database_types');

  const editType = (type: TypeModel) => {
    setType({ [type.dbSymbol]: type });
  };

  return (
    <TypeTableContainer size="full" data-noactive onMouseLeave={() => setHoveredDefensiveType('__undef__')}>
      <TitleContainer onMouseEnter={() => setHoveredDefensiveType('__undef__')}>
        <p>{t('edit')}</p>
        <h3>{t('table')}</h3>
      </TitleContainer>
      <TableTypeContainer>
        <TypeTableHead allTypes={allTypes} t={t} hoveredDefensiveType={hoveredDefensiveType} />
        <TypeTableBodyContainer>
          {allTypes.map((type) => (
            <TypeTableRow
              currentType={type}
              allTypes={allTypes}
              editType={editType}
              key={`${type.dbSymbol}-row`}
              setHoveredDefensiveType={setHoveredDefensiveType}
            />
          ))}
        </TypeTableBodyContainer>
      </TableTypeContainer>
    </TypeTableContainer>
  );
};
