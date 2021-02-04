import StoneItemModel from '../../../../models/entities/item/StoneItem.model';

describe('StoneItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'StoneItem',
      id: 108,
      dbSymbol: 'dusk_stone',
      icon: '108',
      price: 2100,
      socket: 1,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 80,
    };

    expect(obj).toKeepIntegrity(StoneItemModel);
  });
});
