import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { Select } from '@ds/Select';
import { TooltipWrapper } from '@ds/Tooltip';
import { useConfigTexts } from '@hooks/useProjectConfig';
import { useGlobalState } from '@src/GlobalStateProvider';
import { cloneEntity } from '@utils/cloneEntity';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type DashbordFontsNewEditorProps = {
  isAlternative: boolean;
  onClose: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

export const DashboardFontsNewEditor = ({ isAlternative, onClose }: DashbordFontsNewEditorProps) => {
  const { projectConfigValues: texts, setProjectConfigValues: setTexts } = useConfigTexts();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const idRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);
  const lineHeightRef = useRef<HTMLInputElement>(null);
  const [fontOptions, setFontOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [state] = useGlobalState();

  useEffect(() => {
    if (isAlternative) return;

    window.api.getFilePathsFromFolder(
      {
        folderPath: `${state.projectPath}/Fonts/`,
        extensions: ['.ttf'],
        isRecursive: false,
        isFileNameOnly: true,
      },
      (filePaths) => {
        const options = filePaths.filePaths.map((font) => ({
          value: font.replace('.ttf', ''),
          label: font,
        }));
        setFontOptions(options);
        setName(options[0].value);
      },
      () => {
        setFontOptions([]);
      }
    );
  }, [state.projectPath, isAlternative]);

  const onClickNew = () => {
    if (!idRef.current || (!isAlternative && !name) || !sizeRef.current || !lineHeightRef.current) return;

    const data = {
      id: parseInt(idRef.current.value),
      size: parseInt(sizeRef.current.value),
      lineHeight: parseInt(lineHeightRef.current.value),
    };

    const currentEditedTexts = cloneEntity(texts);
    if (isAlternative) {
      currentEditedTexts.fonts.altSizes.push(data);
      currentEditedTexts.fonts.altSizes.sort((a, b) => a.id - b.id);
    } else {
      currentEditedTexts.fonts.ttfFiles.push({ ...data, name });
      currentEditedTexts.fonts.ttfFiles.sort((a, b) => a.id - b.id);
    }
    setTexts(currentEditedTexts);
    onClose();
  };

  const checkDisable = () => {
    if (isAlternative) return false;
    return !name;
  };

  return (
    <Editor type="addition" title={isAlternative ? t('alt_sizes') : t('fonts')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="id">ID</Label>
          <Input
            ref={idRef}
            type="number"
            name="id"
            min="0"
            max="999"
            defaultValue="0"
            onBlur={() => {
              if (idRef.current && !idRef.current.value) {
                idRef.current.value = idRef.current.defaultValue;
              }
            }}
          />
        </InputWithLeftLabelContainer>
        {!isAlternative && (
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('font_name')}
            </Label>
            <Select
              defaultValue={fontOptions[0]?.value}
              options={fontOptions}
              value={name}
              onChange={(event) => setName(event)}
              placeholder={fontOptions.length > 0 ? fontOptions[0]?.label : t('none')}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="size">{t('size')}</Label>
          <Input
            ref={sizeRef}
            type="number"
            name="size"
            min="0"
            max="999"
            defaultValue="0"
            onBlur={() => {
              if (sizeRef.current && !sizeRef.current.value) {
                sizeRef.current.value = sizeRef.current.defaultValue;
              }
            }}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="line-height">{t('line_height')}</Label>
          <Input
            ref={lineHeightRef}
            type="number"
            name="line-height"
            min="0"
            max="999"
            defaultValue="0"
            onBlur={() => {
              if (lineHeightRef.current && !lineHeightRef.current.value) {
                lineHeightRef.current.value = lineHeightRef.current.defaultValue;
              }
            }}
          />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisable() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisable()}>
              {isAlternative ? t('add_the_alt_size') : t('add_the_font')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
