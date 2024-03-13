import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoSizer, List } from 'react-virtualized';
import { TextDialogsRef } from './editors/TextEditorOverlay';
import { useTranslation } from 'react-i18next';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer } from '@components/editor/DataBlockEditorStyle';
import { DarkButton, ClearButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ClearInput } from '@components/inputs';
import { DataTextGrid, DataTextList, DataTextListTable, TableEmpty, TitleContainer } from './TextListStyle';
import { padStr } from '@utils/PadStr';
import { ReactComponent as TranslationIcon } from '@assets/icons/global/translate.svg';
import { useGetTextList, useSetProjectText } from '@utils/ReadingProjectText';
import { useTextPage } from '@utils/usePage';

const getHeight = (length: number) => (length > 8 ? 408 : length * 48);

type TextListProps = {
  dialogsRef: TextDialogsRef;
  disabledTranslation: boolean;
};

export const TextList = ({ dialogsRef, disabledTranslation }: TextListProps) => {
  const { t } = useTranslation('text_management');
  const [research, setResearch] = useState<string>('');
  const [scrollToEnd, setScrollToEnd] = useState<boolean>(false);
  const navigate = useNavigate();
  const { textInfo } = useTextPage();
  const getTextList = useGetTextList();
  const setText = useSetProjectText();
  const texts = useMemo(() => getTextList(textInfo.fileId), [getTextList, textInfo.fileId]);
  const textsFiltered = useMemo(
    () => (research === '' ? texts : texts.filter((text) => text.dialog.toLowerCase().indexOf(research) !== -1)),
    [texts, research]
  );
  const listRef = useRef<List>(null);
  const onClearAll = () => dialogsRef.current?.openDialog('clear', true);
  const onAdd = () => {
    setText(textInfo.fileId, texts.length === 0 ? 0 : texts[texts.length - 1].textId + 1, '');
    setScrollToEnd(true);
  };

  // reset the research and the scroll when we change texts file
  useEffect(() => {
    setResearch('');
    listRef.current?.scrollToRow(0);
  }, [textInfo.fileId]);

  // scroll to end of the list when a new text is added in the list
  useEffect(() => {
    if (scrollToEnd) {
      listRef.current?.scrollToRow(textsFiltered.length);
      setScrollToEnd(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textsFiltered.length]);

  return (
    <DataBlockEditorContainer size="full" color="light" data-noactive>
      <TitleContainer>
        <h3>{t('texts')}</h3>
        <ClearInput
          name="research"
          value={research}
          onChange={(event) => setResearch(event.target.value.toLowerCase())}
          placeholder={t('search_text')}
          onClear={() => setResearch('')}
        />
      </TitleContainer>
      {textsFiltered.length > 0 ? (
        <DataTextListTable>
          <DataTextGrid gap="8px" className="header">
            <span>ID</span>
            <span>{t('text')}</span>
            <span />
          </DataTextGrid>
          <DataTextList height={getHeight(textsFiltered.length)}>
            <AutoSizer>
              {({ width, height }) => {
                return (
                  <List
                    ref={listRef}
                    className="scrollable-view"
                    width={width}
                    height={height}
                    rowHeight={48}
                    rowCount={textsFiltered.length}
                    rowRenderer={({ key, index, style }) => {
                      return (
                        <div
                          className="line"
                          key={`${textInfo.fileId}-${textsFiltered[index].textId}-${key}`}
                          style={{ ...style, width: 'calc(100% - 4px)' }}
                        >
                          <span className="line-number">#{padStr(textsFiltered[index].textId, 4)}</span>
                          <ClearInput
                            key={`${textsFiltered[index].textId}-${textsFiltered[index].dialog}`}
                            defaultValue={textsFiltered[index].dialog}
                            placeholder={`[~ ${index}]`}
                            onBlur={(event) => {
                              const newText = event.target.value;
                              if (newText === event.target.defaultValue) return;
                              setText(textInfo.fileId, textsFiltered[index].textId, newText);
                            }}
                            onClear={() => setText(textInfo.fileId, textsFiltered[index].textId, '')}
                          />
                          <DarkButton
                            onClick={() => {
                              navigate('/texts/translation', {
                                state: {
                                  position: textsFiltered[index].textId + 1,
                                },
                              });
                            }}
                            disabled={disabledTranslation}
                          >
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
        <ClearButtonWithIcon onClick={onClearAll} disabled={textsFiltered.length === 0}>
          {t('clear_all')}
        </ClearButtonWithIcon>
        <ButtonRightContainer>
          <DarkButton onClick={() => dialogsRef.current?.openDialog('import')}>{t('import_texts')}</DarkButton>
          <SecondaryButtonWithPlusIconResponsive onClick={onAdd} data-tooltip-responsive={t('add_a_text')}>
            {t('add_a_text')}
          </SecondaryButtonWithPlusIconResponsive>
        </ButtonRightContainer>
      </ButtonContainer>
    </DataBlockEditorContainer>
  );
};
