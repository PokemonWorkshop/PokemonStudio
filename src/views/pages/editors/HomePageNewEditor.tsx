import { CreateProjectButton, ImportProjectButton } from '@components/buttons';
import { useRefreshUI } from '@components/editor';
import { Editor, EditorWithCollapse } from '@components/editor/Editor';
import {
  EditorChildWithSubEditorContainer,
  SubEditorContainer,
  SubEditorSeparator,
  SubEditorTopButtonContainer,
} from '@components/editor/EditorContainer';
import { IconInput, Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import { TextInputError } from '@components/inputs/Input';

const iconFileExtensions = ['png'];

const DefaultLanguage = ['en', 'fr', 'es'] as const;
export type DefaultLanguageType = typeof DefaultLanguage[number];
export interface ProjectCreationData extends ProjectStudioModel {
  icon?: string;
  defaultLanguage: DefaultLanguageType;
  multiLanguage: boolean;
}

const languageEntries = (t: TFunction<'homepage'>) => DefaultLanguage.map((language) => ({ value: language, label: t(language) }));
const wrongTitle = (title: string) => {
  return title.match('[\\\\/:*?"<>|$.]') !== null;
};

export const HomePageNewEditor: FunctionComponent = () => {
  const { t } = useTranslation('homepage');
  const [projectData, setProjectData] = useState<Omit<ProjectCreationData, 'clone'>>({
    title: '',
    defaultLanguage: 'en',
    multiLanguage: false,
    studioVersion: '1.0.0',
    iconPath: 'project_icon.png',
  });
  const refreshUI = useRefreshUI();
  const languageOptions = useMemo(() => languageEntries(t), [t]);

  return (
    <EditorWithCollapse type="studio" title={t('new_project')}>
      <EditorChildWithSubEditorContainer>
        <InputContainer size="l">
          <InputGroupCollapse title={t('general')} gap="24px" collapseByDefault>
            <InputWithTopLabelContainer>
              <Label htmlFor="project_name" required>
                {t('project_name')}
              </Label>
              <Input
                name="project_name"
                type="text"
                value={projectData.title}
                onChange={(event) => {
                  return refreshUI(setProjectData({ ...projectData, title: event.target.value }));
                }}
                error={wrongTitle(projectData.title)}
              />
              {wrongTitle(projectData.title) && <TextInputError>{t('incorrect_title')}</TextInputError>}
            </InputWithTopLabelContainer>
            {!projectData.icon && (
              <InputWithTopLabelContainer>
                <Label htmlFor="project_icon">{t('project_icon')}</Label>
                <DropInput
                  name={t('project_icon')}
                  onFileChoosen={(file) => {
                    refreshUI(setProjectData({ ...projectData, icon: file }));
                  }}
                  extensions={iconFileExtensions}
                  imageHeight={128}
                  imageWidth={128}
                />
              </InputWithTopLabelContainer>
            )}
            {projectData.icon && (
              <InputWithTopLabelContainer>
                <Label htmlFor="project_icon">{t('project_icon')}</Label>
                <IconInput
                  name={t('project_icon')}
                  iconPath={projectData.icon}
                  onIconClear={() => {
                    refreshUI(setProjectData({ ...projectData, icon: undefined }));
                  }}
                  onIconChoosen={(iconPath) => {
                    refreshUI(setProjectData({ ...projectData, icon: iconPath }));
                  }}
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
                value={projectData.defaultLanguage}
                options={languageOptions}
                onChange={(language) => refreshUI((projectData.defaultLanguage = language as DefaultLanguageType))}
                noTooltip
              />
            </InputWithTopLabelContainer>
            <InputWithLeftLabelContainer>
              <Label htmlFor="multi_language">{t('multi_language')}</Label>
              <Toggle onChange={(event) => (projectData.multiLanguage = event.target.checked)} />
            </InputWithLeftLabelContainer>
          </InputGroupCollapse>
        </InputContainer>
        <SubEditorContainer>
          <SubEditorTopButtonContainer>
            <ToolTipContainer>
              {(projectData.title.length === 0 || wrongTitle(projectData.title)) && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
              <CreateProjectButton
                projectData={projectData}
                onBusy={() => null}
                disabled={projectData.title.length === 0 || wrongTitle(projectData.title)}
              >
                {t('create_my_project')}
              </CreateProjectButton>
            </ToolTipContainer>
          </SubEditorTopButtonContainer>
          <SubEditorSeparator parentEditorHasScrollBar />
          <Editor type="importation" title={t('import_existing_project')}>
            <ImportProjectButton>{t('browse_my_files')}</ImportProjectButton>
          </Editor>
        </SubEditorContainer>
      </EditorChildWithSubEditorContainer>
    </EditorWithCollapse>
  );
};
