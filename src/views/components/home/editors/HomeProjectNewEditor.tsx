import { NewProjectButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor/Editor';
import { IconInput, Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import React, { forwardRef, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { TextInputError } from '@components/inputs/Input';
import { basename, dirname } from '@utils/path';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DefaultLanguages, DefaultLanguageType, NewProjectData } from '@utils/useProjectNew/types';

const iconFileExtensions = ['png'];

const languageEntries = (t: TFunction<'homepage'>) => DefaultLanguages.map((language) => ({ value: language, label: t(language) }));
const wrongTitle = (title: string) => {
  return title.match('[\\\\/:*?"<>|$.]') !== null;
};

type HomeProjectNewEditorProps = {
  closeDialog: () => void;
};

export const HomeProjectNewEditor = forwardRef<EditorHandlingClose, HomeProjectNewEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('homepage');
  const [newProjectData, setNewProjectData] = useState<Omit<NewProjectData, 'clone'>>({
    title: '',
    icon: undefined,
    defaultLanguage: 'en',
    multiLanguage: false,
    languagesTranslation: [{ code: 'en', name: 'English' }],
  });
  const languageOptions = useMemo(() => languageEntries(t), [t]);

  const isDisabled = () => newProjectData.title.length === 0 || wrongTitle(newProjectData.title);

  useEditorHandlingClose(ref);

  return (
    <EditorWithCollapse type="studio" title={t('new_project')}>
      <InputContainer size="l">
        <InputGroupCollapse title={t('general')} gap="24px" collapseByDefault>
          <InputWithTopLabelContainer>
            <Label htmlFor="project_name" required>
              {t('project_name')}
            </Label>
            <Input
              name="project_name"
              type="text"
              value={newProjectData.title}
              onChange={(event) => setNewProjectData({ ...newProjectData, title: event.target.value })}
              error={wrongTitle(newProjectData.title)}
            />
            {wrongTitle(newProjectData.title) && <TextInputError>{t('incorrect_title')}</TextInputError>}
          </InputWithTopLabelContainer>
          {!newProjectData.icon && (
            <InputWithTopLabelContainer>
              <Label htmlFor="project_icon">{t('project_icon')}</Label>
              <DropInput
                name={t('project_icon')}
                onFileChoosen={(file) => setNewProjectData({ ...newProjectData, icon: file })}
                extensions={iconFileExtensions}
                imageHeight={128}
                imageWidth={128}
              />
            </InputWithTopLabelContainer>
          )}
          {newProjectData.icon && (
            <InputWithTopLabelContainer>
              <Label htmlFor="project_icon">{t('project_icon')}</Label>
              <IconInput
                name={t('project_icon')}
                iconPathInProject={basename(newProjectData.icon)}
                projectPath={dirname(newProjectData.icon)}
                onIconClear={() => setNewProjectData({ ...newProjectData, icon: undefined })}
                onIconChoosen={(iconPath) => setNewProjectData({ ...newProjectData, icon: iconPath })}
                extensions={iconFileExtensions}
              />
            </InputWithTopLabelContainer>
          )}
        </InputGroupCollapse>
        <InputGroupCollapse title={t('parameters')} gap="24px" collapseByDefault>
          <InputWithTopLabelContainer>
            <Label htmlFor="default_language">{t('default_langauge')}</Label>
            <SelectCustomSimple
              id="select-default-language"
              value={newProjectData.defaultLanguage}
              options={languageOptions}
              onChange={(language) => setNewProjectData({ ...newProjectData, defaultLanguage: language as DefaultLanguageType })}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="multi_language">{t('multi_language')}</Label>
            <Toggle onChange={(event) => setNewProjectData({ ...newProjectData, multiLanguage: event.target.checked })} />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
        <ToolTipContainer>
          {isDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
          <NewProjectButton newProjectData={newProjectData} disabled={isDisabled()} closeDialog={closeDialog} />
        </ToolTipContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
});
HomeProjectNewEditor.displayName = 'HomeProjectNewEditor';
