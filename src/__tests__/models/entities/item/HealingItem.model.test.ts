import HealingItemModel from '../../../../models/entities/item/HealingItem.model';

describe('HealingItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'HealingItem',
      id: 169,
      dbSymbol: 'pomeg_berry',
      icon: '169',
      price: 20,
      socket: 4,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 10,
      loyaltyMalus: -2,
    };

    expect(obj).toKeepIntegrity(HealingItemModel);
  });
});
