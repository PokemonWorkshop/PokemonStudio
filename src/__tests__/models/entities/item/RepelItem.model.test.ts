import RepelItemModel from '../../../../models/entities/item/RepelItem.model';

describe('RepelItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'RepelItem',
      id: 76,
      dbSymbol: 'super_repel',
      icon: '076',
      price: 500,
      socket: 1,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: true,
      isHoldable: true,
      flingPower: 0,
      repelCount: 200,
    };

    expect(obj).toKeepIntegrity(RepelItemModel);
  });
});
