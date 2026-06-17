import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ResourceImage } from '@components/ResourceImage';
import { Tag } from '@components/Tag';
import { TypeCategoryPokemonBattler } from '@components/categories/TypeCategory';
import { DataFieldsetFieldWithChild } from '@components/database/dataBlocks/DataFieldsetField';

import { itemIconPath, pokemonIconPath } from '@utils/path';
import {
  useProjectAbilities,
  useProjectItems,
  useProjectMoves,
  useProjectNatures,
  useProjectPokemon,
} from '@hooks/useProjectData';
import { useGetEntityNameText, useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

import type { GiftCreature, GiftEgg } from '@utils/onlineApi';

/**
 * Mirrors the trainer-party `PokemonBattler` card, but reads from a
 * `GiftCreature` blob (the mystery-gift API shape) instead of a
 * `StudioGroupEncounter`. Resolves every dbSymbol against the currently-loaded
 * project so the gift detail looks identical to a trainer's party member.
 *
 * Egg variant: pass `asEgg`. Eggs hide level, held-item, nickname, and EV/IV
 * tags (these aren't part of the egg schema) but otherwise render the same
 * species/form/gender/nature treatment.
 *
 * Stat arrays from the server arrive as `[hp, atk, def, spd, ats, dfs]` per
 * PSDK_ONLINE_API.md; Studio internally uses `{hp, atk, dfe, ats, dfs, spd}`
 * (note `dfe`, not `def`). We convert at the render boundary.
 */

type Props = {
  c: GiftCreature | GiftEgg;
  index: number;
  asEgg?: boolean;
};

const CardOuter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.dark16};
  ${({ theme }) => theme.fonts.normalMedium};

  & ${Tag} {
    background-color: ${({ theme }) => theme.colors.dark20};
  }

  & span.error {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

const CardHeader = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 12px;
  align-items: center;
  min-height: 40px;

  & img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }

  & div.name-level {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  & span.level {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
  }

  & div.badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const HeldItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;

  & img {
    max-width: 32px;
    max-height: 32px;
  }
`;

const AbilityNature = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const MovesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 4px 16px;
  padding-top: 4px;
  border-top: 1px dashed ${({ theme }) => theme.colors.dark20};
`;

const MetaField = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};

  strong {
    color: ${({ theme }) => theme.colors.text100};
    font-weight: 500;
  }
`;

const ShinyBadge = styled(Tag)`
  background-color: ${({ theme }) => theme.colors.warningSoft} !important;
  color: ${({ theme }) => theme.colors.warningBase};
`;

const STAT_LABELS = ['HP', 'Atk', 'Def', 'Spe', 'SpA', 'SpD'] as const;

const isFemaleFromGender = (gender: GiftCreature['gender']): boolean => {
  if (typeof gender === 'number') return gender === 2;
  if (typeof gender === 'string') return gender === '2' || gender.toLowerCase() === 'female' || gender.toLowerCase() === 'f';
  return false;
};

const iconKind = (shiny: boolean | undefined, female: boolean): 'icon' | 'iconF' | 'iconShiny' | 'iconShinyF' => {
  if (shiny) return female ? 'iconShinyF' : 'iconShiny';
  return female ? 'iconF' : 'icon';
};

const formatScalar = (v: unknown): string => (v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

const isStatArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length === 6 && v.every((n) => typeof n === 'number' && !Number.isNaN(n));

export const GiftCreatureCard = ({ c, index, asEgg }: Props) => {
  const { t } = useTranslation();
  const { projectDataValues: species } = useProjectPokemon();
  const { projectDataValues: abilities } = useProjectAbilities();
  const { projectDataValues: items } = useProjectItems();
  const { projectDataValues: natures } = useProjectNatures();
  const { projectDataValues: moves } = useProjectMoves();
  const getEntityName = useGetEntityNameText();
  const getAbilityName = useGetEntityNameTextUsingTextId();

  const creature = c as GiftCreature; // Eggs are a structural subset of GiftCreature.

  const specie = creature.id ? species[creature.id] : undefined;
  const female = isFemaleFromGender(creature.gender);
  const kind = iconKind(creature.shiny, female);

  const heldItemSymbol = typeof creature.item === 'string' ? creature.item : undefined;
  const heldItem = heldItemSymbol ? items[heldItemSymbol] : undefined;

  const abilitySymbol = typeof creature.ability === 'string' ? creature.ability : undefined;
  const ability = abilitySymbol ? abilities[abilitySymbol] : undefined;

  // Nature may arrive as either a string dbSymbol (older create paths) or a
  // numeric id (server-required format) — look up either form.
  const nature =
    typeof creature.nature === 'string'
      ? natures[creature.nature]
      : typeof creature.nature === 'number'
      ? Object.values(natures).find((n) => n.id === creature.nature)
      : undefined;

  const moveList = (creature.moves ?? []).filter((m) => typeof m === 'string' && m.length > 0 && m !== '__undef__');

  // Convert PSDK stat arrays [hp, atk, def, spd, ats, dfs] to tag rows.
  const ivs = isStatArray(creature.stats) ? creature.stats : undefined;
  const evs = isStatArray(creature.bonus as unknown) ? (creature.bonus as unknown as number[]) : undefined;

  const renderStatTags = (stats: number[]) =>
    stats.map((n, i) =>
      n === 0 ? null : (
        <Tag key={`${i}-${STAT_LABELS[i]}`}>{`${n} ${STAT_LABELS[i]}`}</Tag>
      ),
    );

  return (
    <CardOuter>
      <CardHeader>
        {specie ? (
          <ResourceImage
            imagePathInProject={pokemonIconPath(specie, creature.form ?? 0, kind)}
            fallback={creature.form ? pokemonIconPath(specie) : undefined}
          />
        ) : (
          <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
        )}
        <div className="name-level">
          {specie ? <span>{getEntityName(specie)}</span> : <span className="error">{creature.id || t('creature_deleted')}</span>}
          {!asEgg && <span className="level">{t('level_value', { level: creature.level })}</span>}
          {asEgg && <span className="level">{t('egg')}</span>}
        </div>
        <div className="badges">
          {creature.shiny && <ShinyBadge>✨ {t('online_gift_field_shiny')}</ShinyBadge>}
          {creature.form !== undefined && creature.form !== 0 && <Tag>{t('online_gift_field_form')} {creature.form}</Tag>}
          {creature.gender !== undefined && <Tag>{female ? '♀' : creature.gender === 1 || creature.gender === '1' ? '♂' : '⚲'}</Tag>}
        </div>
      </CardHeader>

      {heldItemSymbol && !asEgg && (
        <HeldItem>
          {heldItem ? (
            <>
              <ResourceImage imagePathInProject={itemIconPath(heldItem.icon)} />
              <span>{getEntityName(heldItem)}</span>
            </>
          ) : (
            <span className="error">
              {t('online_gift_field_held_item')}: {formatScalar(creature.item)}
            </span>
          )}
        </HeldItem>
      )}

      {(ability || abilitySymbol || nature || creature.ability !== undefined) && (
        <AbilityNature>
          {(ability || abilitySymbol || creature.ability !== undefined) && (
            <DataFieldsetFieldWithChild label={t('online_gift_field_ability')}>
              {ability ? getAbilityName(ability) : <span className="error">{formatScalar(creature.ability)}</span>}
            </DataFieldsetFieldWithChild>
          )}
          {(nature || creature.nature) && (
            <DataFieldsetFieldWithChild label={t('online_gift_field_nature')}>
              {nature ? getEntityName(nature) : <span className="error">{creature.nature}</span>}
            </DataFieldsetFieldWithChild>
          )}
        </AbilityNature>
      )}

      {!asEgg && moveList.length > 0 && (
        <MovesGrid>
          {moveList.map((moveSymbol, i) =>
            moves[moveSymbol] ? (
              <TypeCategoryPokemonBattler key={`${i}-${moveSymbol}`} type={moves[moveSymbol].type} isClickable={false} shortcutNavigation={() => undefined}>
                {getEntityName(moves[moveSymbol])}
              </TypeCategoryPokemonBattler>
            ) : (
              <span key={`${i}-${moveSymbol}`} className="error">
                {moveSymbol}
              </span>
            ),
          )}
        </MovesGrid>
      )}

      {ivs && (
        <TagRow>
          <MetaField>
            <strong>{t('online_gift_field_ivs')}:</strong>
          </MetaField>
          {renderStatTags(ivs)}
        </TagRow>
      )}
      {evs && !asEgg && (
        <TagRow>
          <MetaField>
            <strong>{t('online_gift_field_evs')}:</strong>
          </MetaField>
          {renderStatTags(evs)}
        </TagRow>
      )}

      {(creature.given_name ||
        creature.loyalty !== undefined ||
        creature.captured_with !== undefined ||
        creature.captured_in !== undefined ||
        creature.trainer_name ||
        creature.trainer_id !== undefined) && (
        <MetadataGrid>
          {creature.given_name && !asEgg && (
            <MetaField>
              <strong>{t('online_gift_field_nickname')}:</strong> {creature.given_name}
            </MetaField>
          )}
          {creature.loyalty !== undefined && (
            <MetaField>
              <strong>{t('online_gift_field_loyalty')}:</strong> {creature.loyalty}
            </MetaField>
          )}
          {creature.captured_with !== undefined && !asEgg && (
            <MetaField>
              <strong>{t('online_gift_field_captured_with')}:</strong> {formatScalar(creature.captured_with)}
            </MetaField>
          )}
          {creature.captured_in !== undefined && !asEgg && (
            <MetaField>
              <strong>{t('online_gift_field_captured_in')}:</strong> {creature.captured_in}
            </MetaField>
          )}
          {creature.trainer_name && (
            <MetaField>
              <strong>{t('online_gift_field_trainer_name')}:</strong> {creature.trainer_name}
            </MetaField>
          )}
          {creature.trainer_id !== undefined && (
            <MetaField>
              <strong>{t('online_gift_field_trainer_id')}:</strong> {creature.trainer_id}
            </MetaField>
          )}
          <MetaField>
            <strong>#{index + 1}</strong>
          </MetaField>
        </MetadataGrid>
      )}
    </CardOuter>
  );
};
