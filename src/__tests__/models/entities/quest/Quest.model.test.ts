import QuestModel from '../../../../models/entities/quest/Quest.model';

describe('QuestModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'Quest',
      id: 1,
      isPrimary: false,
      objectives: [
        {
          objectiveMethodName: 'objective_speak_to',
          objectiveMethodArgs: [0, 'Jean'],
          textFormatMethodName: 'text_speak_to',
          hiddenByDefault: false,
        },
      ],
      earnings: [
        {
          earningMethodName: 'earning_item',
          earningArgs: ['cherish_ball', 1],
          textFormatMethodName: 'text_earn_item',
        },
      ],
    };

    expect(obj).toKeepIntegrity(QuestModel);
  });
});
