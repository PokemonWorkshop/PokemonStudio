import { DarkButton, DeleteButtonWithIcon } from '@components/buttons';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DataBlockWithTitleNoActive } from '@components/database/dataBlocks/DataBlockWithTitle';
import { TypeEditorAndDeletionKeys, TypeEditorOverlay } from '@components/database/type/editors/TypeEditorOverlay';
import { TypeControlBar } from '@components/database/type/TypeControlBar';
import { TypeEfficiencyData } from '@components/database/type/TypeEfficiencyData';
import { TypeFrame } from '@components/database/type/TypeFrame';
import { TypeResistanceData } from '@components/database/type/TypeResistanceData';
import { TooltipWrapper } from '@ds/Tooltip';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useTypePage } from '@hooks/usePage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

export const TypePage = () => {
  const dialogsRef = useDialogsRef<TypeEditorAndDeletionKeys>();
  const { currentTypeName, currentType, canBeDeleted } = useTypePage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DatabasePageStyle>
      <TypeControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <TypeFrame dialogsRef={dialogsRef} />
            <TypeEfficiencyData />
            <TypeResistanceData />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithTitleNoActive size="half" title={t('list_all_creature', { type: currentTypeName })} data-noactive>
              <DarkButton onClick={() => navigate(`/database/types/${currentType.dbSymbol}/pokemon`)}>{t('show_all_creature')}</DarkButton>
            </DataBlockWithTitleNoActive>
            <DataBlockWithTitleNoActive size="half" title={t('list_all_moves', { type: currentTypeName })} data-noactive>
              <DarkButton onClick={() => navigate(`/database/types/${currentType.dbSymbol}/moves`)}>{t('show_all_moves')}</DarkButton>
            </DataBlockWithTitleNoActive>
            <DataBlockWithAction title={t('deletion')} size="full" disabled={canBeDeleted}>
              <TooltipWrapper data-tooltip={canBeDeleted ? t('type_deletion_disabled') : undefined}>
                <DeleteButtonWithIcon onClick={() => dialogsRef?.current?.openDialog('deletion', true)} disabled={canBeDeleted}>
                  {t('delete_this_type')}
                </DeleteButtonWithIcon>
              </TooltipWrapper>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <TypeEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
