import BallItemModel from '../../../../models/entities/item/BallItem.model';

describe('BallItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'BallItem',
      id: 1,
      dbSymbol: 'master_ball',
      icon: '001',
      price: 0,
      socket: 2,
      position: 4,
      isBattleUsable: true,
      isMapUsable: false,
      isLimited: true,
      isHoldable: true,
      flingPower: 0,
      spriteFilename: 'ball_4',
      catchRate: 255,
      color: {
        red: 255,
        green: 0,
        blue: 0,
        alpha: 255,
      },
    };

    expect(obj).toKeepIntegrity(BallItemModel);
  });
});
