import TrainerModel from '../../../../models/entities/trainer/Trainer.model';

describe('TrainerModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'TrainerBattleSetup',
      id: 4,
      dbSymbol: null,
      vsType: 1,
      isCouple: false,
      baseMoney: 30,
      battlers: ['001'],
      bags: [],
      battleId: 0,
      ai: 0,
      parties: [
        [
          {
            specie: 'bulbasaur',
            formIndex: 0,
            shinySetup: {
              kind: 'automatic',
            },
            levelSetup: {
              kind: 'fixed',
              fixedLevel: 1,
            },
            ivs: {
              hp: 0,
              atk: 0,
              dfe: 0,
              spd: 0,
              ats: 0,
              dfs: 0,
            },
            evs: {
              hp: 0,
              atk: 0,
              dfe: 0,
              spd: 0,
              ats: 0,
              dfs: 0,
            },
            itemHeld: 'none',
            loyalty: 70,
            moves: ['__undef__', '__undef__', '__undef__', '__undef__'],
            originalTrainerName: 'Jean',
            originalTrainerId: 0,
          },
        ],
      ],
    };

    expect(obj).toKeepIntegrity(TrainerModel);
  });
});
