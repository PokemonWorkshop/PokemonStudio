import EventItemModel from '../../../../models/entities/item/EventItem.model';

describe('EventItemModel', () => {
  it('should keep integrity', () => {
    const obj = {
      klass: 'EventItem',
      id: 433,
      dbSymbol: 'journal',
      icon: '433',
      price: 0,
      socket: 5,
      position: 0,
      isBattleUsable: false,
      isMapUsable: true,
      isLimited: false,
      isHoldable: false,
      flingPower: 0,
      eventId: 7,
    };

    expect(obj).toKeepIntegrity(EventItemModel);
  });
});
