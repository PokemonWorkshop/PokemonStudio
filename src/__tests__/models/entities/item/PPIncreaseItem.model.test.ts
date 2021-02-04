import PPIncreaseItemModel from '../../../../models/entities/item/PPIncreaseItem.model';

describe('PPIncreaseItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'PPIncreaseItem',
      id: 51,
      dbSymbol: 'pp_up',
      icon: '051',
      price: 9800,
      socket: 6,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
      loyaltyMalus: 0,
      isMax: false,
    };

    expect(obj).toKeepIntegrity(PPIncreaseItemModel);
  });
});
