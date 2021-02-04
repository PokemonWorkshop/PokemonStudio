import ItemModel from '../../../../models/entities/item/Item.model';

describe('ItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'Item',
      id: 104,
      dbSymbol: 'armor_fossil',
      icon: '104',
      price: 1000,
      socket: 1,
      position: 0,
      isBattleUsable: false,
      isMapUsable: false,
      isLimited: false,
      isHoldable: true,
      flingPower: 100,
    };

    expect(obj).toKeepIntegrity(ItemModel);
  });
});
