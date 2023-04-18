import React, { useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { TextDialogsRef } from './editors/TextEditorOverlay';
import { useTranslation } from 'react-i18next';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { DarkButton, ClearButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ClearInput, Input } from '@components/inputs';
import { DataTextGrid, DataTextList, DataTextListTable, TableEmpty, TitleContainer } from './TextListStyle';
import { padStr } from '@utils/PadStr';
import { ReactComponent as TranslationIcon } from '@assets/icons/global/translate.svg';

const getHeight = (length: number) => (length > 8 ? 408 : length * 48);

type TextListProps = {
  dialogsRef: TextDialogsRef;
};

export const TextList = ({ dialogsRef }: TextListProps) => {
  // TODO: get real data
  const texts = [
    "J'ai gagné !",
    'Tu as encore des progrès à faire...',
    '[~ 2]',
    '[~ 3]',
    '[~ 4]',
    '[~ 5]',
    '[~ 6]',
    '[~ 7]',
    '[~ 8]',
    '[~ 9]',
    '[~ 10]',
  ];
  const { t } = useTranslation('text_management');
  const [research, setResearch] = useState<string>('');

  // TODO: code it!
  const onClearAll = () => console.log('clear all');
  const onAdd = () => console.log('add');

  return (
    <DataBlockEditorContainer size="full" color="light" data-noactive>
      <TitleContainer>
        <h3>{t('texts')}</h3>
        <Input name="research" value={research} onChange={(event) => setResearch(event.target.value)} placeholder={t('search_text')} />
      </TitleContainer>
      {texts.length > 0 ? (
        <DataTextListTable>
          <DataTextGrid gap="8px" className="header">
            <span>ID</span>
            <span>{t('text')}</span>
            <span />
          </DataTextGrid>
          <DataTextList height={getHeight(texts.length)}>
            <AutoSizer>
              {({ width, height }) => {
                return (
                  <List
                    className="scrollable-view"
                    width={width}
                    height={height}
                    rowHeight={48}
                    rowCount={texts.length}
                    rowRenderer={({ key, index, style }) => {
                      return (
                        <div className="line" key={key} style={{ ...style, width: 'calc(100% - 4px)' }}>
                          <span className="line-number">#{padStr(index, 4)}</span>
                          <ClearInput
                            defaultValue={texts[index]}
                            placeholder={`[~ ${index}]`}
                            onBlur={(event) => console.log(`save ${event.target.value}`)} // TODO: code it!
                            onClear={() => console.log(`clear ${index}`)} // TODO: code it!
                          />
                          <DarkButton onClick={() => console.log(`go translation ${index}`)}>
                            <TranslationIcon />
                          </DarkButton>
                        </div>
                      );
                    }}
                    tabIndex={null}
                  />
                );
              }}
            </AutoSizer>
          </DataTextList>
        </DataTextListTable>
      ) : (
        <TableEmpty>{t('no_text')}</TableEmpty>
      )}
      <ButtonContainer color="light">
        <ClearButtonWithIcon onClick={onClearAll} disabled={texts.length === 0}>
          {t('clear_all')}
        </ClearButtonWithIcon>
        <ButtonRightContainer>
          <DarkButton onClick={() => dialogsRef.current?.openDialog('import')}>{t('import_texts')}</DarkButton>
          <SecondaryButtonWithPlusIconResponsive onClick={onAdd} tooltip={{ right: '100%', top: '100%' }}>
            {t('add_a_text')}
          </SecondaryButtonWithPlusIconResponsive>
        </ButtonRightContainer>
      </ButtonContainer>
    </DataBlockEditorContainer>
  );
};
