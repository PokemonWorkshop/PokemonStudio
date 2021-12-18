import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TypeTableContainer, TypeTableHead, TypeTableRow, TypeTableBodyContainer, TableTypeContainer } from './table';
import { TitleContainer } from '@components/editor/DataBlockEditorStyle';
import { useProjectTypes } from '@utils/useProjectData';
import TypeModel from '@modelEntities/type/Type.model';

export const TypeTable = () => {
  const { projectDataValues: types, setProjectDataValues: setType } = useProjectTypes();
  const allTypes = useMemo(() => Object.values(types).sort((a, b) => a.id - b.id), [types]);
  const { t } = useTranslation('database_types');

  const editType = (type: TypeModel) => {
    setType({ [type.dbSymbol]: type });
  };

  return (
    <TypeTableContainer size="full" data-noactive>
      <TitleContainer>
        <p>{t('edit')}</p>
        <h3>{t('table')}</h3>
      </TitleContainer>
      <TableTypeContainer>
        <TypeTableHead allTypes={allTypes} t={t} />
        <TypeTableBodyContainer>
          {allTypes.map((type) => (
            <TypeTableRow currentType={type} allTypes={allTypes} editType={editType} key={`${type.dbSymbol}-row`} />
          ))}
        </TypeTableBodyContainer>
      </TableTypeContainer>
    </TypeTableContainer>
  );
};
