import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useProjectTrainers, useProjectPokemon } from '@hooks/useProjectData';
import { useResourceImageSrc } from '@components/ResourceImage';
import { useGetProjectText } from '@utils/ReadingProjectText';
import { pokemonIconPath, trainerResourcePath } from '@utils/path';
import { TRAINER_CLASS_TEXT_ID, TRAINER_NAME_TEXT_ID } from '@modelEntities/trainer';
import type { StudioCreature } from '@modelEntities/creature';
import type { StudioGroupEncounter } from '@modelEntities/groupEncounter';

/**
 * Fork-owned. Preview for the Start Trainer Battle command: the trainer's
 * artwork/sprite plus their party (Studio icons + levels), looked up live from
 * the project by numeric trainer id.
 */

const Wrap = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  align-items: center;
`;

const Sprite = styled.img`
  width: 96px;
  max-height: 120px;
  object-fit: contain;
  image-rendering: pixelated;
  flex: none;
`;

const SpritePlaceholder = styled.div`
  width: 96px;
  height: 96px;
  flex: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.dark18};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const TrainerName = styled.div`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text100};
`;

const Party = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Mon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 46px;
`;

// Studio pokéicons are horizontal 2-frame strips. Crop to a single square frame
// (width = height) by clipping the left square of the height-scaled image.
const MonIconBox = styled.div`
  width: 40px;
  height: 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const MonIcon = styled.img`
  height: 40px;
  width: auto;
  max-width: none;
  image-rendering: pixelated;
  display: block;
`;

const MonIconPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.dark18};
`;

const MonLvl = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const Empty = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  padding: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.dark14};
  border-radius: 8px;
`;

const levelLabel = (ls: StudioGroupEncounter['levelSetup']): string =>
  ls.kind === 'fixed' ? `Lv.${ls.level}` : `Lv.${ls.level.minimumLevel}-${ls.level.maximumLevel}`;

const PartyMon: React.FC<{ creature: StudioCreature | undefined; encounter: StudioGroupEncounter }> = ({ creature, encounter }) => {
  const src = useResourceImageSrc(creature ? pokemonIconPath(creature, encounter.form) : 'graphics/pokedex/pokeicon/__none__');
  return (
    <Mon title={creature ? creature.dbSymbol : encounter.specie}>
      {creature ? <MonIconBox><MonIcon src={src} alt="" /></MonIconBox> : <MonIconPlaceholder />}
      <MonLvl>{levelLabel(encounter.levelSetup)}</MonLvl>
    </Mon>
  );
};

type Props = { trainerId: number };

export const TrainerBattlePreview: React.FC<Props> = ({ trainerId }) => {
  const { t } = useTranslation();
  const getText = useGetProjectText();
  const { projectDataValues: trainers } = useProjectTrainers();
  const { projectDataValues: creatures } = useProjectPokemon();
  const trainer = React.useMemo(() => Object.values(trainers).find((tr) => tr.id === trainerId), [trainers, trainerId]);

  // Prefer the full artwork; fall back to the battle sprite. Hooks run
  // unconditionally, so resolve both and pick below.
  const artworkSrc = useResourceImageSrc(trainer && trainer.resources.artworkFull ? trainerResourcePath(trainer, 'artworkFull') : 'graphics/battlers/__none__');
  const spriteSrc = useResourceImageSrc(trainer && trainer.resources.sprite ? trainerResourcePath(trainer, 'sprite') : 'graphics/battlers/__none__');

  if (!trainer) return <Empty>{t('me_events_trainer_not_found', { id: trainerId })}</Empty>;

  const hasArt = !!trainer.resources.artworkFull;
  const hasSprite = !!trainer.resources.sprite;
  const imgSrc = hasArt ? artworkSrc : hasSprite ? spriteSrc : null;

  // Localized "Class Name" (e.g. "Youngster Joey"); fall back to the dbSymbol.
  const className = getText(TRAINER_CLASS_TEXT_ID, trainer.id).trim();
  const trainerName = getText(TRAINER_NAME_TEXT_ID, trainer.id).trim();
  const label = [className, trainerName].filter(Boolean).join(' ') || trainer.dbSymbol;

  return (
    <Wrap>
      {imgSrc ? <Sprite src={imgSrc} alt="" /> : <SpritePlaceholder />}
      <Info>
        <TrainerName>{label}</TrainerName>
        {trainer.party.length === 0 ? (
          <MonLvl>{t('me_events_trainer_empty_party')}</MonLvl>
        ) : (
          <Party>
            {trainer.party.map((encounter, i) => (
              <PartyMon key={i} creature={creatures[encounter.specie]} encounter={encounter} />
            ))}
          </Party>
        )}
      </Info>
    </Wrap>
  );
};
