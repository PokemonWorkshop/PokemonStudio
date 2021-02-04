import PokemonModel from '../../../../models/entities/pokemon/Pokemon.model';

describe('PokemonModel', () => {
  it('should keep integrity', () => {
    const obj = {
      id: 133,
      dbSymbol: 'eevee',
      forms: [
        {
          form: 0,
          height: 0.3,
          weight: 6.5,
          type1: 'normal',
          type2: '__undef__',
          baseHp: 55,
          baseAtk: 55,
          baseDfe: 50,
          baseSpd: 55,
          baseAts: 45,
          baseDfs: 65,
          evHp: 0,
          evAtk: 0,
          evDfe: 0,
          evSpd: 0,
          evAts: 0,
          evDfs: 1,
          evolutionId: 0,
          evolutionLevel: 0,
          specialEvolutions: [
            {
              dbSymbol: 'vaporeon',
              stone: 'water_stone',
            },
            {
              dbSymbol: 'jolteon',
              stone: 'thunder_stone',
            },
            {
              dbSymbol: 'flareon',
              stone: 'fire_stone',
            },
            {
              dbSymbol: 'espeon',
              minLoyalty: 220,
              dayNight: 3,
            },
            {
              dbSymbol: 'umbreon',
              minLoyalty: 220,
              dayNight: 0,
            },
            {
              dbSymbol: 'leafeon',
              maps: [1],
            },
            {
              dbSymbol: 'glaceon',
              maps: [1],
            },
            {
              dbSymbol: 'sylveon',
              minLoyalty: 220,
              func: 'elv_nymphali',
            },
          ],
          experienceType: 1,
          baseExperience: 65,
          baseLoyalty: 70,
          catchRate: 45,
          femaleRate: 12,
          breedGroups: [5, 5],
          hatchSteps: 8960,
          babyId: 133,
          itemHeld: [],
          abilities: ['run_away', 'adaptability', 'anticipation'],
          frontOffsetY: 24,
          moveSet: [
            {
              klass: 'LevelLearnableMove',
              level: 1,
              move: 'tackle',
            },
            {
              klass: 'LevelLearnableMove',
              level: 3,
              move: 'growl',
            },
            {
              klass: 'LevelLearnableMove',
              level: 7,
              move: 'leech_seed',
            },
            {
              klass: 'LevelLearnableMove',
              level: 9,
              move: 'vine_whip',
            },
            {
              klass: 'LevelLearnableMove',
              level: 13,
              move: 'poison_powder',
            },
            {
              klass: 'LevelLearnableMove',
              level: 13,
              move: 'sleep_powder',
            },
            {
              klass: 'LevelLearnableMove',
              level: 15,
              move: 'take_down',
            },
            {
              klass: 'LevelLearnableMove',
              level: 19,
              move: 'razor_leaf',
            },
            {
              klass: 'LevelLearnableMove',
              level: 21,
              move: 'sweet_scent',
            },
            {
              klass: 'LevelLearnableMove',
              level: 25,
              move: 'growth',
            },
            {
              klass: 'LevelLearnableMove',
              level: 27,
              move: 'double_edge',
            },
            {
              klass: 'LevelLearnableMove',
              level: 31,
              move: 'worry_seed',
            },
            {
              klass: 'LevelLearnableMove',
              level: 33,
              move: 'synthesis',
            },
            {
              klass: 'LevelLearnableMove',
              level: 37,
              move: 'seed_bomb',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'bind',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'snore',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'giga_drain',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'synthesis',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'knock_off',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'worry_seed',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'seed_bomb',
            },
            {
              klass: 'TutorLearnableMove',
              move: 'grass_pledge',
            },
            {
              klass: 'TechLearnableMove',
              move: 'swords_dance',
            },
            {
              klass: 'TechLearnableMove',
              move: 'cut',
            },
            {
              klass: 'TechLearnableMove',
              move: 'strength',
            },
            {
              klass: 'TechLearnableMove',
              move: 'solar_beam',
            },
            {
              klass: 'TechLearnableMove',
              move: 'toxic',
            },
            {
              klass: 'TechLearnableMove',
              move: 'double_team',
            },
            {
              klass: 'TechLearnableMove',
              move: 'light_screen',
            },
            {
              klass: 'TechLearnableMove',
              move: 'flash',
            },
            {
              klass: 'TechLearnableMove',
              move: 'rest',
            },
            {
              klass: 'TechLearnableMove',
              move: 'substitute',
            },
            {
              klass: 'TechLearnableMove',
              move: 'protect',
            },
            {
              klass: 'TechLearnableMove',
              move: 'sludge_bomb',
            },
            {
              klass: 'TechLearnableMove',
              move: 'swagger',
            },
            {
              klass: 'TechLearnableMove',
              move: 'attract',
            },
            {
              klass: 'TechLearnableMove',
              move: 'sleep_talk',
            },
            {
              klass: 'TechLearnableMove',
              move: 'return',
            },
            {
              klass: 'TechLearnableMove',
              move: 'frustration',
            },
            {
              klass: 'TechLearnableMove',
              move: 'safeguard',
            },
            {
              klass: 'TechLearnableMove',
              move: 'hidden_power',
            },
            {
              klass: 'TechLearnableMove',
              move: 'sunny_day',
            },
            {
              klass: 'TechLearnableMove',
              move: 'rock_smash',
            },
            {
              klass: 'TechLearnableMove',
              move: 'facade',
            },
            {
              klass: 'TechLearnableMove',
              move: 'nature_power',
            },
            {
              klass: 'TechLearnableMove',
              move: 'secret_power',
            },
            {
              klass: 'TechLearnableMove',
              move: 'energy_ball',
            },
            {
              klass: 'TechLearnableMove',
              move: 'grass_knot',
            },
            {
              klass: 'TechLearnableMove',
              move: 'venoshock',
            },
            {
              klass: 'TechLearnableMove',
              move: 'round',
            },
            {
              klass: 'TechLearnableMove',
              move: 'echoed_voice',
            },
            {
              klass: 'TechLearnableMove',
              move: 'confide',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'petal_dance',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'sludge',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'skull_bash',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'amnesia',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'curse',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'giga_drain',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'endure',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'charm',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'nature_power',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'ingrain',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'grass_whistle',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'magical_leaf',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'leaf_storm',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'power_whip',
            },
            {
              klass: 'BreedLearnableMove',
              move: 'grassy_terrain',
            },
          ],
        },
      ],
      klass: 'Specie',
    };

    expect(obj).toKeepIntegrity(PokemonModel);
  });
});
