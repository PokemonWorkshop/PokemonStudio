import BackIcon from '@assets/icons/global/back.svg';
import { CommandLibraryCard } from './CommandLibraryCard';
import { StudioEventCommandCategory } from '@modelEntities/event/category';
import { COMMANDS_FROM_CATEGORY } from '@modelEntities/event/command';
import { EventIcon, IconsFromCategory } from '../generic/EventIcon';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import styled from 'styled-components';
import React, { useMemo } from 'react';

const CommandLibraryBlockContainer = styled.div.attrs((props) => ({ 'data-color': props.color }))`
  .category-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px 12px;
    gap: 8px;
    box-sizing: border-box;
    align-items: center;

    &[data-color='violet'] {
      background: linear-gradient(180deg, rgb(39, 27, 53) 0%, rgba(39, 27, 53, 0) 50%);
    }

    &[data-color='blue'] {
      background: linear-gradient(180deg, rgb(9, 36, 56) 0%, rgba(9, 36, 56, 0) 50%);
    }

    .back-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 24px;
      width: 24px;
      color: ${({ theme }) => theme.colors.text400};

      & svg {
        height: 12px;
        width: 12px;
      }
    }

    .category-title {
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.text100};
    }

    .count {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 0px 4px;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      border: 1px solid rgb(46, 48, 54);
      border-radius: 4px;

      ${({ theme }) => theme.fonts.normalMedium}
    }
  }

  .commands {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 8px;
    padding: 8px 12px 8px 12px;
    max-height: ${({ theme }) => `calc(${theme.calc.height} - 170px)`};
  }
`;

type CommandLibraryBlockProps = {
  category: StudioEventCommandCategory;
  setSelectedCommandCategory: (category: StudioEventCommandCategory | undefined) => void;
  research?: string;
};

const getCommands = (category: StudioEventCommandCategory, t: TFunction, research?: string) => {
  const isDev = window.api.isDev;
  const commandsAvailable = isDev ? COMMANDS_FROM_CATEGORY[category] : COMMANDS_FROM_CATEGORY[category].filter(({ enabled }) => enabled);
  if (!research) return commandsAvailable;

  return commandsAvailable
    .map((command) => ({ command, title: t(`event_command_${command.commandType}`) }))
    .filter(({ title }) => title.toLowerCase().indexOf(research) !== -1)
    .map(({ command }) => command);
};

export const CommandLibraryBlock = ({ category, setSelectedCommandCategory, research }: CommandLibraryBlockProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commands = useMemo(() => getCommands(category, t, research), [category, research]);
  const commandsCount = commands.length;

  return research && commandsCount === 0 ? (
    <></>
  ) : (
    <CommandLibraryBlockContainer>
      <div className="category-header" data-color={IconsFromCategory[category].color}>
        {!research && (
          <span className="back-icon" onClick={() => setSelectedCommandCategory(undefined)}>
            <BackIcon />
          </span>
        )}
        <EventIcon icon={{ type: 'category', category }} size="s" />
        <span className="category-title">{t(`event_category_${category}`)}</span>
        <span className="count">{commandsCount}</span>
      </div>
      <div className="commands">
        {commands.map(({ commandType, helper }) => (
          <CommandLibraryCard key={commandType} command={commandType} hasHelper={helper} />
        ))}
      </div>
    </CommandLibraryBlockContainer>
  );
};
