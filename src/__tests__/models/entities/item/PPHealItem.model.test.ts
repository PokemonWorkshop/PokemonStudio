import PPHealItemModel from '../../../../models/entities/item/PPHealItem.model';

describe('PPHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'PPHealItem',
      id: 154,
      dbSymbol: 'leppa_berry',
      icon: '154',
      price: 20,
      socket: 4,
      position: 0,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 10,
      loyaltyMalus: 0,
      ppCount: 10,
    };

    expect(obj).toKeepIntegrity(PPHealItemModel);
  });
});
