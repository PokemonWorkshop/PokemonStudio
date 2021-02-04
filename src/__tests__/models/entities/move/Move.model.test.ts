import MoveModel from '../../../../models/entities/move/Move.model';

describe('MoveModel', () => {
  it('should keep integrity', () => {
    const obj = {
      id: 51,
      dbSymbol: 'acid',
      klass: 'Move',
      mapUse: 0,
      battleEngineMethod: 's_basic',
      type: 8,
      power: 40,
      accuracy: 100,
      pp: 30,
      category: 'Special',
      movecriticalRate: 1,
      priority: 14,
      isDirect: false,
      isCharge: false,
      isBlocable: true,
      isSnatchable: false,
      isMirrorMove: true,
      isPunch: false,
      isGravity: false,
      isMagicCoatAffected: false,
      isUnfreeze: false,
      isSoundAttack: false,
      isDistance: false,
      isHeal: false,
      isAuthentic: false,
      isBite: false,
      isPulse: false,
      isBallistics: false,
      isMental: false,
      isNonSkyBattle: false,
      isDance: false,
      isKingRockUtility: false,
      isEffectChance: false,
      battleEngineAimedTarget: 'adjacent_all_foe',
      battleStageMod: [
        {
          battleStage: 'DFS_STAGE',
          modificator: -1,
        },
      ],
      moveStatus: [
        {
          status: null,
          luckRate: 10,
        },
      ],
    };

    expect(obj).toKeepIntegrity(MoveModel);
  });
});
