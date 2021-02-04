import FleeingItemModel from '../../../../models/entities/item/FleeingItem.model';

describe('FleeingItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'FleeingItem',
      id: 228,
      dbSymbol: 'smoke_ball',
      icon: '228',
      price: 200,
      socket: 1,
      position: 0,
      isBattleUsable: false,
      isMapUsable: false,
      isLimited: true,
      isHoldable: true,
      flingPower: 30,
    };

    expect(obj).toKeepIntegrity(FleeingItemModel);
  });
});
