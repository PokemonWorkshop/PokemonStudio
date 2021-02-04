import ZoneModel from '../../../../models/entities/zone/Zone.model';

describe('ZoneModel', () => {
  it('should keep integrity', () => {
    const obj = {
      id: 4,
      dbSymbol: null,
      klass: 'Zone',
      maps: [0],
      worldmaps: [null],
      pannelId: 0,
      warpX: null,
      warpY: null,
      positionX: null,
      positionY: null,
      isFlyAllowed: true,
      isWarpDisallowed: false,
      forcedWeather: null,
      subZones: [],
      wildGroups: [
        {
          systemTag: 'TallGrass',
          doubleBattle: false,
          hordeBattle: false,
          customCondition: [],
          encounters: [
            {
              specie: 'bulbasaur',
              formIndex: 0,
              shinySetup: {
                kind: 'automatic',
              },
              levelSetup: {
                kind: 'minmax',
                minimumLevel: 49,
                maximumLevel: 51,
                randomEncounterChance: 20,
              },
              gender: 2,
              evs: {
                hp: 0,
                atk: 0,
                dfe: 0,
                spd: 0,
                ats: 0,
                dfs: 0,
              },
              ability: 'surge_surfer',
              loyalty: 70,
              moves: ['pound', 'karate_chop', 'comet_punch', 'fire_punch'],
            },
          ],
          terrainTag: 0,
        },
      ],
    };

    expect(obj).toKeepIntegrity(ZoneModel);
  });
});
