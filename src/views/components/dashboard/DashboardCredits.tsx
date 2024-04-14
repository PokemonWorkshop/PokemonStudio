import React, { useMemo, useState } from 'react';
import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { join, basename } from '@utils/path';
import { PageEditor } from '@components/pages';
import { DropInput } from '@components/inputs/DropInput';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import styled from 'styled-components';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigCredits } from '@utils/useProjectConfig';
import { DeleteButtonWithIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { CreditMembersTable } from '@components/database/credits/tables/CreditMembersTable';
import { ButtonContainer, ButtonRightContainer } from '@components/editor/DataBlockEditorStyle';
import { MemberNewEditor } from '@components/database/credits/editors/MemberNewEditor';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text400};
`;

const InputWithInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputSizes = styled(EmbeddedUnitInput)`
  text-align: left;
  min-width: 0px;
`;

export const DashboardCredits = () => {
  const { t } = useTranslation('dashboard_credits');
  const { projectConfigValues: credits, setProjectConfigValues: setCredits } = useConfigCredits();
  const currentEditedCredits = useMemo(() => cloneEntity(credits), [credits]);
  const [scrollSpeed, setScrollSpeed] = useState<number>(currentEditedCredits.scrollSpeed);
  const [lineHeight, setLineHeight] = useState<number>(currentEditedCredits.lineHeight);
  const [leaderSpacing, setLeaderSpacing] = useState<number>(currentEditedCredits.leaderSpacing);
  const [chiefProjectTitle, setChiefProjectTitle] = useState<string>(currentEditedCredits.chiefProjectTitle);
  const [chiefProjectName, setChiefProjectName] = useState<string>(currentEditedCredits.chiefProjectName);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [gameCredits, setGameCredits] = useState<string>(currentEditedCredits.gameCredits);

  const handleInputChange = (key: string, value: string | number): void => {
    switch (key) {
      case 'scrollSpeed':
        setScrollSpeed(value as number);
        break;
      case 'lineHeight':
        setLineHeight(value as number);
        break;
      case 'leaderSpacing':
        setLeaderSpacing(value as number);
        break;
      case 'chiefProjectTitle':
        setChiefProjectTitle(value as string);
        break;
      case 'chiefProjectName':
        setChiefProjectName(value as string);
        break;
      default:
        break;
    }
    setCredits({ ...currentEditedCredits, [key]: value });
  };

  const onImageCreditChoosen = (image: string) => {
    const imageName = basename(image);
    handleInputChange('image', imageName);
  };

  const onMusicCreditChoosen = (musicPath: string) => {
    const musicFilename = basename(musicPath);
    const bgm = join('audio/bgm', musicFilename).replaceAll('\\', '/');
    handleInputChange('bgm', bgm);
  };

  const inputSizesRender = (name: string, value: string | number, key: string, handleInputChange: (key: string, value: string) => void) => {
    //TODO set limits and negative numbers
    return (
      <>
        <InputContainer>
          <InputSizes
            unit="px"
            type="number"
            name={name}
            min="1"
            max="9999"
            value={isNaN(value as number) ? '' : value}
            onChange={(event) => {
              handleInputChange(key, event.target.value);
            }}
            placeholder={value.toString()}
          />
        </InputContainer>
      </>
    );
  };

  const inputRender = (name: string, value: string | number, key: string, handleInputChange: (key: string, value: string) => void) => {
    return (
      <>
        <Input
          type="text"
          name={name}
          value={value}
          onChange={(event) => handleInputChange(key, event.target.value)}
          placeholder={key === 'chiefProjectTitle' ? t('project_leader_role') : t('leader_name')}
        />
      </>
    );
  };

  const onCloseEditor = () => {
    setCredits(currentEditedCredits);
    setCurrentEditor(undefined);
  };

  //TODO
  const onEditMember = () => {};

  const editors = {
    newMember: <MemberNewEditor credits={currentEditedCredits} onClose={() => setCurrentEditor(undefined)} />,
  };

  const onClickDelete = () => {
    setCredits({ ...currentEditedCredits, leaders: [] });
    setCurrentDeletion(undefined);
  };

  const onDeleteAll = () => {
    setCurrentDeletion('members');
  };

  const deletions = {
    members: (
      <Deletion
        title={t('deletion_of_members')}
        message={t('deletion_message_all_members')}
        onClickDelete={() => onClickDelete()}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  const onNew = () => {
    setCurrentEditor('newMember');
  };

  return (
    <>
      <PageEditor title={t('resources')} editorTitle={t('credits')}>
        <InputWithTopLabelContainer>
          <Label htmlFor="intro_image">{t('intro_image')}</Label>
          <DropInput
            destFolderToCopy="graphics/pictures"
            name={t('credit_image')}
            extensions={['png']}
            onFileChoosen={onImageCreditChoosen}
            multipleFiles={true}
          />
          <Label htmlFor="background_music">{t('background_music')}</Label>
          <DropInput destFolderToCopy="audio/bgm" name={t('background_music')} extensions={AUDIO_EXT} onFileChoosen={onMusicCreditChoosen} />
        </InputWithTopLabelContainer>
      </PageEditor>
      <PageEditor title={t('settings')} editorTitle={t('credits')}>
        <InputWithInfoContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="scroll_speed">{t('scroll_speed')}</Label>
            {inputSizesRender('scroll_speed', scrollSpeed, 'scrollSpeed', handleInputChange)}
          </InputWithLeftLabelContainer>
        </InputWithInfoContainer>
        <InputWithInfoContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="line_Height">{t('line_Height')}</Label>
            {inputSizesRender('line_Height', lineHeight, 'lineHeight', handleInputChange)}
          </InputWithLeftLabelContainer>
        </InputWithInfoContainer>
        <InputWithInfoContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="leader_spacing">{t('leader_spacing')}</Label>
            {inputSizesRender('leader_spacing', leaderSpacing, 'leaderSpacing', handleInputChange)}
          </InputWithLeftLabelContainer>
        </InputWithInfoContainer>
      </PageEditor>
      <PageEditor title={t('project_leader')} editorTitle={t('section')}>
        <InputWithTopLabelContainer>
          <Label htmlFor="project_leader_role">{t('project_leader_role')}</Label>
          {inputRender('leader-role', chiefProjectTitle, 'chiefProjectTitle', handleInputChange)}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="project_leader_name">{t('project_leader_name')}</Label>
          {inputRender('leader-name', chiefProjectName, 'chiefProjectName', handleInputChange)}
        </InputWithTopLabelContainer>
      </PageEditor>
      <PageEditor title={t('development_team')} editorTitle={t('section')}>
        <CreditMembersTable credits={currentEditedCredits} onEdit={onEditMember} />
        <ButtonContainer>
          <DeleteButtonWithIcon onClick={onDeleteAll}>{t('delete_all')}</DeleteButtonWithIcon>
          <ButtonRightContainer>
            <SecondaryButtonWithPlusIcon onClick={onNew}>{t('add_members')}</SecondaryButtonWithPlusIcon>
          </ButtonRightContainer>
        </ButtonContainer>
      </PageEditor>
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
      <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
      <PageEditor title={t('game_credits')} editorTitle={t('section')}>
        <InputWithTopLabelContainer>
          <MultiLineInput id="credit" value={gameCredits} placeholder={t('game_credits')} onChange={(event) => setGameCredits(event.target.value)} />
        </InputWithTopLabelContainer>
      </PageEditor>
    </>
  );
};
