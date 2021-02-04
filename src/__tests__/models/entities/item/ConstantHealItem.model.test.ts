import ConstantHealItemModel from '../../../../models/entities/item/ConstantHealItem.model';

describe('ConstantHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'ConstantHealItem',
      id: 134,
      dbSymbol: 'sweet_heart',
      icon: '134',
      price: 100,
      socket: 6,
      position: 0,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
      loyaltyMalus: 0,
      hpCount: 20,
    };

    expect(obj).toKeepIntegrity(ConstantHealItemModel);
  });
});
