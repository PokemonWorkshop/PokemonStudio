import StatusHealItemModel from '../../../../models/entities/item/StatusHealItem.model';

describe('StatusHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'StatusHealItem',
      id: 149,
      dbSymbol: 'cheri_berry',
      icon: '149',
      price: 20,
      socket: 4,
      position: 0,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 10,
      loyaltyMalus: 0,
      statusList: ['PARALYZED'],
    };

    expect(obj).toKeepIntegrity(StatusHealItemModel);
  });
});
