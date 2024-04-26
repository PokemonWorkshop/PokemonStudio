import React, { useMemo, useRef, useState } from 'react';
import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, MultiLineInput, PictureInput } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { basename } from '@utils/path';
import { PageEditor } from '@components/pages';
import { DropInput } from '@components/inputs/DropInput';
import { AUDIO_EXT, AudioInput } from '@components/inputs/AudioInput';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { cloneEntity } from '@utils/cloneEntity';
import { useConfigCredits } from '@utils/useProjectConfig';
import { DeleteButtonWithIcon, SecondaryButtonWithPlusIcon } from '@components/buttons';
import { CreditMembersTable } from '@components/database/credits/tables/CreditMembersTable';
import { ButtonContainer, ButtonRightContainer } from '@components/editor/DataBlockEditorStyle';
import { MemberEditEditor } from '@components/database/credits/editors/MemberEditEditor';
import { MemberNewEditor } from '@components/database/credits/editors/MemberNewEditor';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';
import { assertUnreachable } from '@utils/assertUnreachable';
import styled from 'styled-components';

const InputSizes = styled(EmbeddedUnitInput)`
  text-align: right;
  min-width: 0px;
`;

const ScrollSpeedInput = styled(InputSizes)`
  width: 92px !important;
`;

type InputKeys = 'scrollSpeed' | 'lineHeight' | 'leaderSpacing' | 'chiefProjectTitle' | 'chiefProjectName';

export const DashboardCredits = () => {
  const { t } = useTranslation('dashboard_credits');
  const { projectConfigValues: credits, setProjectConfigValues: setCredits } = useConfigCredits();
  const currentEditedCredits = useMemo(() => cloneEntity(credits), [credits]);
  const inputsRef = {
    scrollSpeed: useRef<HTMLInputElement>(null),
    lineHeight: useRef<HTMLInputElement>(null),
    leaderSpacing: useRef<HTMLInputElement>(null),
    chiefProjectTitle: useRef<HTMLInputElement>(null),
    chiefProjectName: useRef<HTMLInputElement>(null),
  };
  const gameCreditsRef = useRef<HTMLTextAreaElement>(null);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

  const handleInputBlur = (key: InputKeys) => {
    const inputRef = inputsRef[key];
    if (!inputRef.current) return;

    switch (key) {
      case 'chiefProjectName':
      case 'chiefProjectTitle':
        if (inputRef.current.value === '') {
          inputRef.current.value = currentEditedCredits[key];
          return;
        }
        setCredits({ ...currentEditedCredits, [key]: inputRef.current.value });
        break;
      case 'leaderSpacing':
      case 'lineHeight':
      case 'scrollSpeed': {
        const value = inputRef.current.valueAsNumber;
        if (!inputRef.current.validity.valid || isNaN(value)) {
          inputRef.current.value = currentEditedCredits[key].toString();
          return;
        }

        setCredits({ ...currentEditedCredits, [key]: value });
        break;
      }
      default:
        assertUnreachable(key);
    }
  };

  const handleGameCreditsBlur = () => {
    if (!gameCreditsRef.current) return;

    setCredits({ ...currentEditedCredits, gameCredits: gameCreditsRef.current.value });
  };

  const onImageCreditChoosen = (image: string) => {
    const projectSplash = basename(image, '.png');
    setCredits({ ...currentEditedCredits, projectSplash });
  };

  const onImageCreditClear = () => setCredits({ ...currentEditedCredits, projectSplash: '' });

  const onMusicCreditChoosen = (musicPath: string) => {
    const bgm = basename(musicPath);
    setCredits({ ...currentEditedCredits, bgm });
  };

  const onMusicCreditClear = () => setCredits({ ...currentEditedCredits, bgm: '' });

  const inputSizesRender = (name: string, key: InputKeys) => {
    return key === 'scrollSpeed' ? (
      <ScrollSpeedInput
        unit="px/s"
        offsetUnit="49px"
        type="number"
        name={name}
        min="1"
        max="9999"
        defaultValue={credits[key]}
        placeholder={credits[key].toString()}
        onBlur={() => handleInputBlur(key)}
        ref={inputsRef[key]}
      />
    ) : (
      <InputSizes
        unit="px"
        type="number"
        name={name}
        min="1"
        max="9999"
        defaultValue={credits[key]}
        placeholder={credits[key].toString()}
        onBlur={() => handleInputBlur(key)}
        ref={inputsRef[key]}
      />
    );
  };

  const inputRender = (name: string, key: InputKeys) => {
    return (
      <>
        <Input
          type="text"
          name={name}
          defaultValue={credits[key]}
          placeholder={key === 'chiefProjectTitle' ? t('dashboard_credits:project_leader_role') : t('dashboard_credits:leader_name')}
          onBlur={() => handleInputBlur(key)}
          ref={inputsRef[key]}
        />
      </>
    );
  };

  const editors = {
    newMember: <MemberNewEditor credits={currentEditedCredits} onClose={() => setCurrentEditor(undefined)} />,
    onEditMember: <MemberEditEditor credits={currentEditedCredits} index={currentMemberIndex} onClose={() => setCurrentEditor(undefined)} />,
  };

  const onCloseEditor = () => {
    setCredits(currentEditedCredits);
    setCurrentEditor(undefined);
  };

  const onEditMember = (index: number) => {
    setCurrentMemberIndex(index);
    setCurrentEditor('onEditMember');
  };

  const onClickDeleteAll = () => {
    setCredits({ ...currentEditedCredits, leaders: [] });
    setCurrentDeletion(undefined);
  };

  const onDeleteAll = () => {
    setCurrentDeletion('members');
  };

  const deletions = {
    members: (
      <Deletion
        title={t('dashboard_credits:deletion_of_members')}
        message={t('dashboard_credits:deletion_message_all_members')}
        onClickDelete={() => onClickDeleteAll()}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  const onNew = () => {
    setCurrentEditor('newMember');
  };

  return (
    <>
      <PageEditor title={t('dashboard_credits:resources')} editorTitle={t('dashboard_credits:credits')}>
        <InputWithTopLabelContainer>
          <Label htmlFor="intro_image">{t('dashboard_credits:intro_image')}</Label>
          {credits.projectSplash === '' ? (
            <DropInput
              destFolderToCopy="graphics/titles"
              name={t('dashboard_credits:intro_image')}
              extensions={['png']}
              onFileChoosen={onImageCreditChoosen}
            />
          ) : (
            <PictureInput
              name={t('dashboard_credits:intro_image')}
              extensions={['png']}
              picturePathInProject={`graphics/titles/${credits.projectSplash}.png`}
              destFolderToCopy="graphics/titles"
              onPictureChoosen={onImageCreditChoosen}
              onPictureClear={onImageCreditClear}
            />
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="background_music">{t('dashboard_credits:background_music')}</Label>
          {credits.bgm === '' ? (
            <DropInput
              destFolderToCopy="audio/bgm"
              name={t('dashboard_credits:background_music')}
              extensions={AUDIO_EXT}
              onFileChoosen={onMusicCreditChoosen}
            />
          ) : (
            <AudioInput
              audioPathInProject={`audio/bgm/${credits.bgm}`}
              destFolderToCopy="audio/bgm"
              name={t('dashboard_credits:background_music')}
              extensions={AUDIO_EXT}
              onAudioChoosen={onMusicCreditChoosen}
              onAudioClear={onMusicCreditClear}
            />
          )}
        </InputWithTopLabelContainer>
      </PageEditor>
      <PageEditor title={t('dashboard_credits:settings')} editorTitle={t('dashboard_credits:credits')}>
        <InputWithLeftLabelContainer>
          <Label htmlFor="scroll_speed">{t('dashboard_credits:scroll_speed')}</Label>
          {inputSizesRender('scroll_speed', 'scrollSpeed')}
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="line_height">{t('dashboard_credits:line_height')}</Label>
          {inputSizesRender('line_height', 'lineHeight')}
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="leader_spacing">{t('dashboard_credits:leader_spacing')}</Label>
          {inputSizesRender('leader_spacing', 'leaderSpacing')}
        </InputWithLeftLabelContainer>
      </PageEditor>
      <PageEditor title={t('dashboard_credits:project_leader')} editorTitle={t('dashboard_credits:section')}>
        <InputWithTopLabelContainer>
          <Label htmlFor="project_leader_role">{t('dashboard_credits:project_leader_role')}</Label>
          {inputRender('leader-role', 'chiefProjectTitle')}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="project_leader_name">{t('dashboard_credits:project_leader_name')}</Label>
          {inputRender('leader-name', 'chiefProjectName')}
        </InputWithTopLabelContainer>
      </PageEditor>
      <PageEditor title={t('dashboard_credits:development_team')} editorTitle={t('dashboard_credits:section')}>
        <CreditMembersTable credits={credits} onEdit={onEditMember} />
        <ButtonContainer>
          <DeleteButtonWithIcon onClick={onDeleteAll}>{t('dashboard_credits:delete_all')}</DeleteButtonWithIcon>
          <ButtonRightContainer>
            <SecondaryButtonWithPlusIcon onClick={onNew}>{t('dashboard_credits:add_members')}</SecondaryButtonWithPlusIcon>
          </ButtonRightContainer>
        </ButtonContainer>
      </PageEditor>
      <EditorOverlay currentEditor={currentEditor} editors={editors} onClose={onCloseEditor} />
      <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
      <PageEditor title={t('dashboard_credits:game_credits')} editorTitle={t('dashboard_credits:section')}>
        <InputWithTopLabelContainer>
          <MultiLineInput
            id="credit"
            defaultValue={credits.gameCredits}
            placeholder={t('dashboard_credits:game_credits')}
            onBlur={handleGameCreditsBlur}
            ref={gameCreditsRef}
          />
        </InputWithTopLabelContainer>
      </PageEditor>
    </>
  );
};
