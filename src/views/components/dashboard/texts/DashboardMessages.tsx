import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigTexts } from '@utils/useProjectConfig';
import { TFunction, useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { PictureInput, Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { useRefreshUI } from '@components/editor';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { SelectCustomSimple } from '@components/SelectCustom';
import { StudioTextChoiceConfig, StudioTextConfig, StudioTextMessageConfig, StudioTextTtfFileConfig } from '@modelEntities/config';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { createConfigTextsChoice, createConfigTextsMessage } from '@utils/entityCreation';

const ReferenceSceneInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const ReferenceSceneErrorContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.dangerBase};
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.dark19};
`;

const fontEntries = (ttfFiles: StudioTextTtfFileConfig[]) => {
  return ttfFiles.map((ttf) => ({ value: ttf.id.toString(), label: `${ttf.id} - ${ttf.name}` }));
};

const defaultTitle = (index: number, key: string, t: TFunction<'dashboard_texts'>, isChoice: boolean) => {
  if (isChoice) {
    if (index === 0) return t('default_choices');
    else return t('scene_choices', { className: key });
  } else {
    switch (index) {
      case 0:
        return t('default_messages');
      case 1:
        return t('battle_messages');
      default:
        return t('scene_messages', { className: key });
    }
  }
};

const isDuplicateKey = (texts: StudioTextConfig, key: string, index: number, isChoice: boolean) => {
  const keys = isChoice ? Object.keys(texts.choices) : Object.keys(texts.messages);
  const result = keys.find((k, idx) => k === key && index !== idx);

  return result === undefined ? false : true;
};

const generateKey = (texts: StudioTextConfig, isChoice: boolean) => {
  const keys = isChoice ? Object.keys(texts.choices) : Object.keys(texts.messages);
  const key = {
    value: 1,
  };

  while (keys.findIndex((k) => k === `Class::Class${key.value}`) !== -1) {
    key.value++;
  }
  return `Class::Class${key.value}`;
};

type DashboardMessagesProps = {
  isChoice: boolean;
};

export const DashboardMessages = ({ isChoice }: DashboardMessagesProps) => {
  const { projectConfigValues: texts, setProjectConfigValues: setTexts } = useConfigTexts();
  const [referenceScene, setReferenceScene] = useState<string | undefined>(undefined);
  const [errorReferenceScene, setErrorReferenceScene] = useState<number | undefined>(undefined);
  const currentEditedTexts = useMemo(() => cloneEntity(texts), [texts]);
  const { t } = useTranslation('dashboard_texts');
  const refreshUI = useRefreshUI();
  const fontOptions = useMemo(() => fontEntries(texts.fonts.ttfFiles), [texts]);
  const messagesOrChoices = useMemo(
    () => (isChoice ? Object.entries(currentEditedTexts.choices) : Object.entries(currentEditedTexts.messages)),
    [currentEditedTexts, isChoice]
  );

  const onChangeReferenceScene = (value: string, index: number) => {
    setReferenceScene(value);
    if (isDuplicateKey(texts, value, index, isChoice)) {
      setErrorReferenceScene(index);
    } else {
      setErrorReferenceScene(undefined);
    }
  };

  const onBlurReferenceScene = (currentKey: string, event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (referenceScene === undefined) return event.preventDefault();

    if (errorReferenceScene === undefined) {
      const saveMessage = isChoice ? currentEditedTexts.choices[currentKey] : currentEditedTexts.messages[currentKey];
      messagesOrChoices.splice(index, 1, [referenceScene, saveMessage]);
      if (isChoice) currentEditedTexts.choices = Object.fromEntries(messagesOrChoices);
      else currentEditedTexts.messages = Object.fromEntries(messagesOrChoices) as Record<string, StudioTextMessageConfig>;
      setTexts(currentEditedTexts);
    }
    setErrorReferenceScene(undefined);
    setReferenceScene(undefined);
  };

  const onDialogBoxChoosen = (dialogBoxPath: string, messageOrChoice: StudioTextMessageConfig | StudioTextChoiceConfig) => {
    messageOrChoice.windowSkin = basename(dialogBoxPath, '.png');
    setTexts(currentEditedTexts);
  };

  const onDialogBoxClear = (messageOrChoice: StudioTextMessageConfig | StudioTextChoiceConfig) => {
    messageOrChoice.windowSkin = null;
    setTexts(currentEditedTexts);
  };

  const onNamesBoxChoosen = (namesBoxPath: string, message: StudioTextMessageConfig) => {
    message.nameWindowSkin = basename(namesBoxPath, '.png');
    setTexts(currentEditedTexts);
  };

  const onNamesBoxClear = (message: StudioTextMessageConfig) => {
    message.nameWindowSkin = null;
    setTexts(currentEditedTexts);
  };

  const onAdd = () => {
    const key = generateKey(texts, isChoice);
    messagesOrChoices.push([key, isChoice ? createConfigTextsChoice() : createConfigTextsMessage()]);
    if (isChoice) currentEditedTexts.choices = Object.fromEntries(messagesOrChoices);
    else currentEditedTexts.messages = Object.fromEntries(messagesOrChoices) as Record<string, StudioTextMessageConfig>;
    setTexts(currentEditedTexts);
  };

  const onDelete = (index: number) => {
    messagesOrChoices.splice(index, 1);
    if (isChoice) currentEditedTexts.choices = Object.fromEntries(messagesOrChoices);
    else currentEditedTexts.messages = Object.fromEntries(messagesOrChoices) as Record<string, StudioTextMessageConfig>;
    setTexts(currentEditedTexts);
  };

  return (
    <PageEditor
      editorTitle={t('texts')}
      title={isChoice ? t('choices') : t('messages')}
      add={{ label: isChoice ? t('add_choices_type') : t('add_messages_type'), onClick: onAdd }}
    >
      {messagesOrChoices.map(([key, messageOrChoice], index) => (
        <InputGroupCollapse
          key={index}
          title={defaultTitle(index, key, t, isChoice)}
          gap="24px"
          noMargin
          onDelete={index >= (isChoice ? 1 : 2) ? () => onDelete(index) : undefined}
        >
          <InputWithTopLabelContainer>
            <Label htmlFor="reference_scene">{t('reference_scene')}</Label>
            <Input
              name="reference_scene"
              value={referenceScene === undefined ? key : referenceScene}
              onChange={(event) => onChangeReferenceScene(event.target.value, index)}
              onBlur={(event) => onBlurReferenceScene(key, event, index)}
              error={index === errorReferenceScene}
            />
            {index === errorReferenceScene ? (
              <ReferenceSceneErrorContainer>
                {isChoice ? t('reference_scene_error_choices') : t('reference_scene_error_messages')}
              </ReferenceSceneErrorContainer>
            ) : (
              <ReferenceSceneInfoContainer>{t('reference_scene_info')}</ReferenceSceneInfoContainer>
            )}
          </InputWithTopLabelContainer>
          {!isChoice && (
            <InputWithLeftLabelContainer>
              <Label htmlFor="line-count">{t('line_count')}</Label>
              <Input
                name="line-count"
                min="1"
                max="99"
                value={isNaN((messageOrChoice as StudioTextMessageConfig).lineCount) ? '' : (messageOrChoice as StudioTextMessageConfig).lineCount}
                onChange={(event) => {
                  const newValue = parseInt(event.target.value);
                  if (newValue < 1 || newValue > 99) return event.preventDefault();
                  refreshUI(((messageOrChoice as StudioTextMessageConfig).lineCount = newValue));
                }}
                onBlur={() => {
                  const message = messageOrChoice as StudioTextMessageConfig;
                  const value = cleanNaNValue(message.lineCount, 1);
                  refreshUI((message.lineCount = value));
                  setTexts(currentEditedTexts);
                }}
              />
            </InputWithLeftLabelContainer>
          )}
          <InputWithLeftLabelContainer>
            <Label htmlFor="border-spacing">{t('border_spacing')}</Label>
            <EmbeddedUnitInput
              name="border-spacing"
              min="0"
              max="99"
              unit="px"
              value={isNaN(messageOrChoice.borderSpacing) ? '' : messageOrChoice.borderSpacing}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                refreshUI((messageOrChoice.borderSpacing = newValue));
              }}
              onBlur={() => {
                const value = cleanNaNValue(messageOrChoice.borderSpacing, 0);
                refreshUI((messageOrChoice.borderSpacing = value));
                setTexts(currentEditedTexts);
              }}
            />
          </InputWithLeftLabelContainer>
          <Divider />
          <InputWithTopLabelContainer>
            <Label htmlFor="dialog-box">{isChoice ? t('choices_box') : t('dialog_box')}</Label>
            {messageOrChoice.windowSkin ? (
              <PictureInput
                name={t('dialog_box')}
                extensions={['png']}
                picturePathInProject={`graphics/windowskins/${messageOrChoice.windowSkin}.png`}
                destFolderToCopy="graphics/windowskins"
                onPictureChoosen={(filePath) => onDialogBoxChoosen(filePath, messageOrChoice)}
                onPictureClear={() => onDialogBoxClear(messageOrChoice)}
              />
            ) : (
              <DropInput
                destFolderToCopy="graphics/windowskins"
                name={t('dialog_box')}
                extensions={['png']}
                onFileChoosen={(filePath) => onDialogBoxChoosen(filePath, messageOrChoice)}
              />
            )}
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="message-font">{isChoice ? t('font_text_default') : t('message_font')}</Label>
            <SelectCustomSimple
              id="select-text-font-name"
              options={fontOptions}
              onChange={(value) => {
                messageOrChoice.defaultFont = parseInt(value);
                setTexts(currentEditedTexts);
              }}
              value={messageOrChoice.defaultFont.toString()}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="message-color">{isChoice ? t('color_text_default') : t('message_color')}</Label>
            <Input
              name="message-color"
              min="0"
              max="999"
              value={isNaN(messageOrChoice.defaultColor) ? '' : messageOrChoice.defaultColor}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 999) return event.preventDefault();
                refreshUI((messageOrChoice.defaultColor = newValue));
              }}
              onBlur={() => {
                const value = cleanNaNValue(messageOrChoice.defaultColor, 0);
                refreshUI((messageOrChoice.defaultColor = value));
                setTexts(currentEditedTexts);
              }}
            />
          </InputWithLeftLabelContainer>
          {!isChoice && (
            <>
              <Divider />
              <InputWithTopLabelContainer>
                <Label htmlFor="names-box">{t('names_box')}</Label>
                {messageOrChoice.nameWindowSkin ? (
                  <PictureInput
                    name={t('names_box')}
                    extensions={['png']}
                    picturePathInProject={`graphics/windowskins/${messageOrChoice.nameWindowSkin}.png`}
                    destFolderToCopy="graphics/windowskins"
                    onPictureChoosen={(filePath) => onNamesBoxChoosen(filePath, messageOrChoice as StudioTextMessageConfig)}
                    onPictureClear={() => onNamesBoxClear(messageOrChoice as StudioTextMessageConfig)}
                  />
                ) : (
                  <DropInput
                    destFolderToCopy="graphics/windowskins"
                    name={t('names_box')}
                    extensions={['png']}
                    onFileChoosen={(filePath) => onNamesBoxChoosen(filePath, messageOrChoice as StudioTextMessageConfig)}
                  />
                )}
              </InputWithTopLabelContainer>
            </>
          )}
        </InputGroupCollapse>
      ))}
    </PageEditor>
  );
};
