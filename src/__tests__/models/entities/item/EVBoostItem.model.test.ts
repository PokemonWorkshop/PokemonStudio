import EVBoostItemModel from '../../../../models/entities/item/EVBoostItem.model';

describe('EVBoostItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'EVBoostItem',
      id: 48,
      dbSymbol: 'carbos',
      icon: '048',
      price: 9800,
      socket: 6,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
      loyaltyMalus: 0,
      stat: 'SPD',
      count: 1,
    };

    expect(obj).toKeepIntegrity(EVBoostItemModel);
  });
});
