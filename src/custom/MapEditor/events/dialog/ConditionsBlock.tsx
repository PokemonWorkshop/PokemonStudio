import React from 'react';
import { useTranslation } from 'react-i18next';
import { CONDITION_OPERATORS } from '../rmxpEventUtils';
import type { MapEventPage } from '../useMapEvents';
import { Toggle } from '@components/inputs';
import { Block, BlockTitle, CheckLabel, Dim, Row, SmallInput, SmallSelect } from './styles';
import { NamePicker, TrueFalse } from './fields';

type Condition = MapEventPage['condition'];

type Props = {
  condition: Condition;
  patchCondition: (partial: Partial<Condition>) => void;
  systemNames: { switches: string[]; variables: string[] };
};

/**
 * The page activation conditions (RMXP switch/variable/self-switch, plus the
 * fork's TRUE/FALSE state, comparison operators, time-of-day and Ruby-script
 * gates). All ANDed together, matching PSDK's enhanced-conditions patch.
 */
export const ConditionsBlock = ({ condition, patchCondition, systemNames }: Props) => {
  const { t } = useTranslation();
  return (
    <Block>
      <BlockTitle>{t('me_events_conditions')}</BlockTitle>
      <Row>
        <CheckLabel>
          <Toggle checked={condition.isSwitch1} onChange={(e) => patchCondition({ isSwitch1: e.target.checked })} />
          {t('me_events_switch')}
        </CheckLabel>
        <NamePicker names={systemNames.switches} value={condition.switch1Id} disabled={!condition.isSwitch1} onChange={(id) => patchCondition({ switch1Id: id })} />
        <Dim $off={!condition.isSwitch1}>{t('me_events_is')}</Dim>
        <TrueFalse value={condition.switch1Expected !== false} disabled={!condition.isSwitch1} onChange={(v) => patchCondition({ switch1Expected: v ? undefined : false })} />
      </Row>
      <Row>
        <CheckLabel>
          <Toggle checked={condition.isSwitch2} onChange={(e) => patchCondition({ isSwitch2: e.target.checked })} />
          {t('me_events_switch')}
        </CheckLabel>
        <NamePicker names={systemNames.switches} value={condition.switch2Id} disabled={!condition.isSwitch2} onChange={(id) => patchCondition({ switch2Id: id })} />
        <Dim $off={!condition.isSwitch2}>{t('me_events_is')}</Dim>
        <TrueFalse value={condition.switch2Expected !== false} disabled={!condition.isSwitch2} onChange={(v) => patchCondition({ switch2Expected: v ? undefined : false })} />
      </Row>
      <Row>
        <CheckLabel>
          <Toggle checked={condition.isVariable} onChange={(e) => patchCondition({ isVariable: e.target.checked })} />
          {t('me_events_variable')}
        </CheckLabel>
        <NamePicker names={systemNames.variables} value={condition.variableId} disabled={!condition.isVariable} onChange={(id) => patchCondition({ variableId: id })} />
        <SmallSelect value={condition.variableOperator ?? 1} disabled={!condition.isVariable} onChange={(e) => patchCondition({ variableOperator: Number(e.target.value) })}>
          {CONDITION_OPERATORS.map((op, i) => (
            <option key={op} value={i}>{op}</option>
          ))}
        </SmallSelect>
        <SmallInput type="number" value={condition.variableValue} disabled={!condition.isVariable} onChange={(e) => patchCondition({ variableValue: Number(e.target.value) || 0 })} />
      </Row>
      <Row>
        <CheckLabel>
          <Toggle checked={condition.isSelfSwitch} onChange={(e) => patchCondition({ isSelfSwitch: e.target.checked })} />
          {t('me_events_self_switch')}
        </CheckLabel>
        <SmallInput type="text" value={condition.selfSwitch} disabled={!condition.isSelfSwitch} onChange={(e) => patchCondition({ selfSwitch: e.target.value })} title={t('me_events_self_switch_hint')} />
        <Dim $off={!condition.isSelfSwitch}>{t('me_events_is_on')}</Dim>
      </Row>
      <Row>
        <CheckLabel title={t('me_events_cond_time_hint')}>
          <Toggle checked={condition.timeCondition !== undefined} onChange={(e) => patchCondition({ timeCondition: e.target.checked ? 'day' : undefined })} />
          {t('me_events_cond_time')}
        </CheckLabel>
        <Dim $off={condition.timeCondition === undefined}>{t('me_events_is')}</Dim>
        <SmallSelect value={condition.timeCondition ?? 'day'} disabled={condition.timeCondition === undefined} onChange={(e) => patchCondition({ timeCondition: e.target.value })}>
          {['day', 'night', 'morning', 'evening'].map((slot) => (
            <option key={slot} value={slot}>{t(`me_events_time_${slot}`)}</option>
          ))}
        </SmallSelect>
      </Row>
      <Row>
        <CheckLabel title={t('me_events_cond_script_hint')}>
          <Toggle checked={condition.scriptCondition !== undefined} onChange={(e) => patchCondition({ scriptCondition: e.target.checked ? '' : undefined })} />
          {t('me_events_cmd_script')}
        </CheckLabel>
        <SmallInput
          type="text"
          style={{ flex: 1, width: 'auto', fontFamily: "'Consolas', 'Monaco', monospace" }}
          placeholder={t('me_events_cond_script_ph')}
          value={condition.scriptCondition ?? ''}
          disabled={condition.scriptCondition === undefined}
          onChange={(e) => patchCondition({ scriptCondition: e.target.value })}
        />
      </Row>
    </Block>
  );
};
