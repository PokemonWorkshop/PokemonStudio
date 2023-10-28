import RateHealItemModel from '../../../../models/entities/item/RateHealItem.model';

describe('RateHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'RateHealItem',
      id: 158,
      dbSymbol: 'sitrus_berry',
      icon: '158',
      price: 20,
      socket: 4,
      position: 0,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 10,
      loyaltyMalus: 0,
      hpRate: 0.25,
    };

    expect(obj).toKeepIntegrity(RateHealItemModel);
  });
});
