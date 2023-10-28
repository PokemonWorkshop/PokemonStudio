import TechItemModel from '../../../../models/entities/item/TechItem.model';

describe('TechItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'TechItem',
      id: 328,
      dbSymbol: 'tm01',
      icon: '328',
      price: 5000,
      socket: 3,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: false,
      isHoldable: false,
      flingPower: 0,
      move: 'hone_claws',
      isHm: false,
    };

    expect(obj).toKeepIntegrity(TechItemModel);
  });
});
