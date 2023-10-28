import LevelIncreaseItemModel from '../../../../models/entities/item/LevelIncreaseItem.model';

describe('LevelIncreaseItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'LevelIncreaseItem',
      id: 50,
      dbSymbol: 'rare_candy',
      icon: '050',
      price: 4800,
      socket: 6,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 0,
      loyaltyMalus: 0,
      levelCount: 1,
    };

    expect(obj).toKeepIntegrity(LevelIncreaseItemModel);
  });
});
