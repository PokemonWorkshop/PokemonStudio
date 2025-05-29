import { clearHistory, hasEntityToSave, hasNext, hasPrevious, markAllAsSaved, pushToHistory, redo, undo } from './history';

describe('history', () => {
  beforeEach(() => clearHistory());

  describe('clearHistory', () => {
    it('clears history properly', () => {
      expect(hasPrevious('type', 'id')).toEqual(false);

      pushToHistory('type', 'id', {});
      expect(hasPrevious('type', 'id')).toEqual(true);

      clearHistory();
      expect(hasPrevious('type', 'id')).toEqual(false);
    });
  });

  describe('pushToHistory', () => {
    it('marks pushed entity as not saved', () => {
      expect(hasEntityToSave()).toEqual(false);

      pushToHistory('type', 'id', {});
      expect(hasEntityToSave()).toEqual(true);
    });
  });

  describe('hasPrevious', () => {
    it('properly detects if history has previous entry for entity', () => {
      expect(hasPrevious('type', 'id')).toEqual(false);

      pushToHistory('type', 'id', {});
      expect(hasPrevious('type', 'id')).toEqual(true);

      undo('type', 'id', {});
      expect(hasPrevious('type', 'id')).toEqual(false);
    });
  });

  describe('hasNext', () => {
    it('properly detects if history has next entry for entity', () => {
      expect(hasNext('type', 'id')).toEqual(false);

      pushToHistory('type', 'id', {});
      undo('type', 'id', {});
      expect(hasNext('type', 'id')).toEqual(true);

      redo('type', 'id', {});
      expect(hasNext('type', 'id')).toEqual(false);
    });
  });

  describe('undo', () => {
    it('does nothing if there is no previous entity', () => {
      expect(undo('type', 'id', {})).toEqual(undefined);
    });

    it('returns the previous entity, push current to next and mark entity as unsaved', () => {
      pushToHistory('type', 'id', { version: '1' });
      pushToHistory('type', 'id', { version: '2' });
      markAllAsSaved();
      expect(hasEntityToSave()).toEqual(false);
      expect(hasNext('type', 'id')).toEqual(false);
      expect(hasPrevious('type', 'id')).toEqual(true);

      expect(undo('type', 'id', { version: '3' })).toEqual({ version: '2' });
      expect(hasNext('type', 'id')).toEqual(true);
      expect(hasPrevious('type', 'id')).toEqual(true);
      expect(hasEntityToSave()).toEqual(true);

      expect(undo('type', 'id', { version: '2' })).toEqual({ version: '1' });
      expect(hasNext('type', 'id')).toEqual(true);
      expect(hasPrevious('type', 'id')).toEqual(false);
      expect(hasEntityToSave()).toEqual(true);
    });
  });

  describe('redo', () => {
    it('does nothing if there is no next entity', () => {
      expect(redo('type', 'id', {})).toEqual(undefined);
    });

    it('returns the previous entity, push current to next and mark entity as unsaved', () => {
      pushToHistory('type', 'id', { version: '1' });
      pushToHistory('type', 'id', { version: '2' });
      undo('type', 'id', { version: '3' }); // Push 3 to next
      undo('type', 'id', { version: '2' }); // Push 2 to next, Current becomes 1
      markAllAsSaved();
      expect(hasEntityToSave()).toEqual(false);
      expect(hasNext('type', 'id')).toEqual(true);
      expect(hasPrevious('type', 'id')).toEqual(false);

      expect(redo('type', 'id', { version: '1' })).toEqual({ version: '2' });
      expect(hasNext('type', 'id')).toEqual(true);
      expect(hasPrevious('type', 'id')).toEqual(true);
      expect(hasEntityToSave()).toEqual(true);

      expect(redo('type', 'id', { version: '2' })).toEqual({ version: '3' });
      expect(hasNext('type', 'id')).toEqual(false);
      expect(hasPrevious('type', 'id')).toEqual(true);
      expect(hasEntityToSave()).toEqual(true);
    });
  });

  describe('markAllAsSaved', () => {
    it('marks all the entity as saved', () => {
      expect(hasEntityToSave()).toEqual(false);

      pushToHistory('type1', 'id1', {});
      pushToHistory('type1', 'id2', {});
      pushToHistory('type2', 'id1', {});
      pushToHistory('type3', 'id1', {});
      expect(hasEntityToSave()).toEqual(true);

      markAllAsSaved();
      expect(hasEntityToSave()).toEqual(false);
    });
  });
});
