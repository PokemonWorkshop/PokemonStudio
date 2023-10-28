import StatBoostItemModel from '../../../../models/entities/item/StatBoostItem.model';

describe('StatBoostItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'StatBoostItem',
      id: 205,
      dbSymbol: 'apicot_berry',
      icon: '205',
      price: 20,
      socket: 4,
      position: 0,
      isBattleUsable: true,
      isMapUsable: false,
      isLimited: true,
      isHoldable: true,
      flingPower: 10,
      loyaltyMalus: 0,
      stat: 'DFS_STAGE',
      count: 1,
    };

    expect(obj).toKeepIntegrity(StatBoostItemModel);
  });
});
