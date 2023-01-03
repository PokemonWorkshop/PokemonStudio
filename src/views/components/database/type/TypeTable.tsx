import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TypeTableContainer, TypeTableHead, TypeTableRow, TypeTableBodyContainer, TableTypeContainer, TypeTableMainContainer } from './table';
import { TitleContainer } from '@components/editor/DataBlockEditorStyle';
import { useProjectTypes } from '@utils/useProjectData';
import { HelperSelectedType, TypeHelper } from './TypeHelper';
import { StudioType } from '@modelEntities/type';

export const TypeTable = () => {
  const { projectDataValues: types, setProjectDataValues: setType } = useProjectTypes();
  const allTypes = useMemo(() => Object.values(types).sort((a, b) => a.id - b.id), [types]);
  const [hoveredDefensiveType, setHoveredDefensiveType] = useState('__undef__');
  const [typeHelperSelected, setTypeHelperSelected] = useState<HelperSelectedType>({ offensiveType: undefined, defensiveType: undefined });
  const { t } = useTranslation('database_types');

  const editType = (type: StudioType) => {
    setType({ [type.dbSymbol]: type });
  };

  const onMouseLeaveEnter = () => {
    setHoveredDefensiveType('__undef__');
    setTypeHelperSelected({ offensiveType: undefined, defensiveType: undefined });
  };

  return (
    <TypeTableMainContainer>
      <TypeTableContainer size="full" data-noactive onMouseLeave={onMouseLeaveEnter}>
        <TitleContainer onMouseEnter={onMouseLeaveEnter}>
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
                setTypeHelperSelected={setTypeHelperSelected}
              />
            ))}
          </TypeTableBodyContainer>
        </TableTypeContainer>
      </TypeTableContainer>
      <TypeHelper typeHelperSelected={typeHelperSelected} allTypes={allTypes} />
    </TypeTableMainContainer>
  );
};
