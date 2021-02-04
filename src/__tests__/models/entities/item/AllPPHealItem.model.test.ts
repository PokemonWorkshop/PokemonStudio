import AllPPHealItemModel from '../../../../models/entities/item/AllPPHealItem.model';

describe('AllPPHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'AllPPHealItem',
      id: 38,
      dbSymbol: 'ether',
      icon: '038',
      price: 1200,
      socket: 6,
      position: 300,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
      loyaltyMalus: 0,
      ppCount: 10,
    };

    expect(obj).toKeepIntegrity(AllPPHealItemModel);
  });
});
