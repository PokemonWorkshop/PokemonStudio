import StatusRateHealItemModel from '../../../../models/entities/item/StatusRateHealItem.model';

describe('StatusRateHealItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'StatusRateHealItem',
      id: 23,
      dbSymbol: 'full_restore',
      icon: '023',
      price: 3000,
      socket: 6,
      position: 5,
      isBattleUsable: true,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
      loyaltyMalus: 0,
      hpRate: 1,
      statusList: [
        'POISONED',
        'PARALYZED',
        'BURN',
        'ASLEEP',
        'FROZEN',
        'CONFUSED',
        'FLINCH',
        'TOXIC',
      ],
    };

    expect(obj).toKeepIntegrity(StatusRateHealItemModel);
  });
});
