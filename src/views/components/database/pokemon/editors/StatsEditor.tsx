import { useRefreshUI } from '@components/editor';
import { EditorWithCollapse } from '@components/editor/Editor';
import { Input, InputContainer, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';

import PokemonModel from '@modelEntities/pokemon/Pokemon.model';

import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

type StatsEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
};

export const StatsEditor: FunctionComponent<StatsEditorProps> = ({ currentPokemon, currentFormIndex }: StatsEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_types']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];

  return (
    <EditorWithCollapse type="edit" title={t('database_pokemon:stats')}>
      <InputContainer size="s">
        <InputGroupCollapse title={t('database_pokemon:base_stats')} collapseByDefault>
          <InputWithLeftLabelContainer>
            <Label htmlFor="hit_points">{t('database_pokemon:hit_points')}</Label>
            <Input
              name="hit_points"
              type="number"
              value={isNaN(form.baseHp) ? '' : form.baseHp}
              onChange={(event) => refreshUI((form.baseHp = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseHp = isNaN(form.baseHp) ? 0 : form.baseHp))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="attack">{t('database_pokemon:attack')}</Label>
            <Input
              name="attack"
              type="number"
              value={isNaN(form.baseAtk) ? '' : form.baseAtk}
              onChange={(event) => refreshUI((form.baseAtk = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseAtk = isNaN(form.baseAtk) ? 0 : form.baseAtk))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="defense">{t('database_pokemon:defense')}</Label>
            <Input
              name="defense"
              type="number"
              value={isNaN(form.baseDfe) ? '' : form.baseDfe}
              onChange={(event) => refreshUI((form.baseDfe = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseDfe = isNaN(form.baseDfe) ? 0 : form.baseDfe))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="special_attack">{t('database_pokemon:special_attack')}</Label>
            <Input
              name="special_attack"
              type="number"
              value={isNaN(form.baseAts) ? '' : form.baseAts}
              onChange={(event) => refreshUI((form.baseAts = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseAts = isNaN(form.baseAts) ? 0 : form.baseAts))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="special_defense">{t('database_pokemon:special_defense')}</Label>
            <Input
              name="special_defense"
              type="number"
              value={isNaN(form.baseDfs) ? '' : form.baseDfs}
              onChange={(event) => refreshUI((form.baseDfs = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseDfs = isNaN(form.baseDfs) ? 0 : form.baseDfs))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="speed">{t('database_pokemon:speed')}</Label>
            <Input
              name="speed"
              type="number"
              value={isNaN(form.baseSpd) ? '' : form.baseSpd}
              onChange={(event) => refreshUI((form.baseSpd = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.baseSpd = isNaN(form.baseSpd) ? 0 : form.baseSpd))}
            />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
        <InputGroupCollapse title={t('database_pokemon:effort_value_ev')} collapseByDefault>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_hit_points">{t('database_pokemon:hit_points')}</Label>
            <Input
              name="ev_hit_points"
              type="number"
              value={isNaN(form.evHp) ? '' : form.evHp}
              onChange={(event) => refreshUI((form.evHp = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evHp = isNaN(form.evHp) ? 0 : form.evHp))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_attack">{t('database_pokemon:attack')}</Label>
            <Input
              name="ev_attack"
              type="number"
              value={isNaN(form.evAtk) ? '' : form.evAtk}
              onChange={(event) => refreshUI((form.evAtk = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evAtk = isNaN(form.evAtk) ? 0 : form.evAtk))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_defense">{t('database_pokemon:defense')}</Label>
            <Input
              name="ev_defense"
              type="number"
              value={isNaN(form.evDfe) ? '' : form.evDfe}
              onChange={(event) => refreshUI((form.evDfe = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evDfe = isNaN(form.evDfe) ? 0 : form.evDfe))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_special_attack">{t('database_pokemon:special_attack')}</Label>
            <Input
              name="ev_special_attack"
              type="number"
              value={isNaN(form.evAts) ? '' : form.evAts}
              onChange={(event) => refreshUI((form.evAts = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evAts = isNaN(form.evAts) ? 0 : form.evAts))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_special_defense">{t('database_pokemon:special_defense')}</Label>
            <Input
              name="ev_special_defense"
              type="number"
              value={isNaN(form.evDfs) ? '' : form.evDfs}
              onChange={(event) => refreshUI((form.evDfs = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evDfs = isNaN(form.evDfs) ? 0 : form.evDfs))}
            />
          </InputWithLeftLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="ev_speed">{t('database_pokemon:speed')}</Label>
            <Input
              name="ev_speed"
              type="number"
              value={isNaN(form.evSpd) ? '' : form.evSpd}
              onChange={(event) => refreshUI((form.evSpd = parseInt(event.target.value)))}
              onBlur={() => refreshUI((form.evSpd = isNaN(form.evSpd) ? 0 : form.evSpd))}
            />
          </InputWithLeftLabelContainer>
        </InputGroupCollapse>
      </InputContainer>
    </EditorWithCollapse>
  );
};
