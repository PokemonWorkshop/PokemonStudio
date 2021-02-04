import TypeModel from '../../../../models/entities/type/Type.model';

describe('TypeModel', () => {
  it('should keep integrity', () => {
    const obj = {
      textId: 0,
      klass: 'Type',
      id: 1,
      dbSymbol: 'normal',
      damageTo: [
        {
          defensiveType: 13,
          factor: 0.5,
        },
        {
          defensiveType: 14,
          factor: 0,
        },
        {
          defensiveType: 16,
          factor: 0.5,
        },
      ],
    };

    expect(obj).toKeepIntegrity(TypeModel);
  });
});
