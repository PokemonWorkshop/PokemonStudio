import { IpcMainEvent } from 'electron';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import fsPromise from 'fs/promises';
import { z } from 'zod';
import fs from 'fs';
import { deletePSDKDatFile } from './migrateUtils';
import {
  MOVE_DESCRIPTION_TEXT_ID,
  MOVE_CONTEST_DESCRIPTION_TEXT_ID,
  MOVE_VALIDATOR,
  StudioMove,
  StudioMoveContestEffectTag,
} from '@modelEntities/move';
import { parseJSON } from '@utils/json/parse';
import { loadCSV, saveCSV } from '@utils/textManagement';
import { DbSymbol } from '@modelEntities/dbSymbol';

const PRE_MIGRATION_MOVE_VALIDATOR = MOVE_VALIDATOR.omit({ condition: true, appeal: true, jam: true, comboMoves: true, effectTags: true });
type StudioMoveDataBeforeMigration = z.infer<typeof PRE_MIGRATION_MOVE_VALIDATOR>;

//These elements are very long, you should collapse them instead of scrolling down
const combosData: Record<string, string[]> = {
  force_palm: ['hex', 'smelling_salts'],
  thunder_wave: ['hex', 'smelling_salts'],
  agility: ['baton_pass', 'electro_ball'],
  focus_energy: ['blaze_kick', 'drill_run', 'karate_chop', 'night_slash', 'poison_tail', 'shadow_claw', 'stone_edge'],
  stealth_rock: ['dragon_tail', 'roar', 'whirlwind'],
  inferno: ['hex'],
  will_o_wisp: ['hex'],
  lovely_kiss: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  spore: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  hail: ['blizzard', 'glaciate', 'icicle_crash', 'icy_wind', 'powder_snow', 'weather_ball'],
  mean_look: ['explosion', 'memento', 'perish_song', 'self_destruct'],
  rain_dance: ['hurricane', 'soak', 'thunder', 'water_sport', 'weather_ball'],
  sunny_day: ['growth', 'moonlight', 'morning_sun', 'solar_beam', 'synthesis', 'weather_ball'],
  celebrate: ['bestow', 'fling', 'present'],
  covet: ['bestow', 'fling', 'present'],
  happy_hour: ['bestow', 'fling', 'present'],
  wish: ['bestow', 'fling', 'present'],
  amnesia: ['baton_pass', 'stored_power'],
  hone_claws: ['baton_pass', 'stored_power'],
  entrainment: ['circle_throw', 'roar', 'seismic_toss', 'sky_drop', 'smack_down', 'storm_throw', 'vital_throw', 'wake_up_slap'],
  play_nice: ['circle_throw', 'roar', 'seismic_toss', 'sky_drop', 'smack_down', 'storm_throw', 'vital_throw', 'wake_up_slap'],
  sing: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  yawn: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  block: ['explosion', 'memento', 'perish_song', 'self_destruct'],
  defense_curl: ['ice_ball', 'rollout'],
  encore: ['counter', 'destiny_bond', 'grudge', 'metal_burst', 'mirror_coat', 'spite'],
  rest: ['sleep_talk', 'snore'],
  soft_boiled: ['egg_bomb'],
  dark_void: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  grass_whistle: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  hypnosis: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  sleep_powder: ['dream_eater', 'hex', 'nightmare', 'wake_up_slap'],
  poison_gas: ['venom_drench', 'hex', 'venoshock'],
  toxic: ['venom_drench', 'hex', 'venoshock'],
  poison_powder: ['venom_drench', 'hex', 'venoshock'],
  calm_mind: ['baton_pass', 'stored_power'],
  nasty_plot: ['baton_pass', 'stored_power'],
  charge: [
    'charge_beam',
    'discharge',
    'electro_ball',
    'nuzzle',
    'parabolic_charge',
    'shock_wave',
    'spark',
    'thunder',
    'thunder_fang',
    'thunder_punch',
    'thunder_shock',
    'thunderbolt',
    'volt_switch',
    'volt_tackle',
  ],
  mind_reader: ['sheer_cold'],
  parabolic_charge: ['electrify'],
  shift_gear: ['gear_grind'],
  spikes: ['dragon_tail', 'roar', 'whirlwind'],
  string_shot: ['electroweb', 'spider_web', 'sticky_web'],
  taunt: ['counter', 'destiny_bond', 'grudge', 'metal_burst', 'mirror_coat', 'spite'],
  toxic_spikes: ['dragon_tail', 'roar', 'whirlwind', 'venom_drench', 'venoshock', 'hex'],
  endure: ['endeavor', 'flail', 'pain_split', 'reversal'],
  glare: ['hex', 'smelling_salts'],
  rock_polish: ['baton_pass', 'electro_ball'],
  rototiller: ['bullet_seed', 'leech_seed', 'seed_bomb', 'worry_seed'],
  sandstorm: ['sand_attack', 'sand_tomb', 'weather_ball'],
  stockpile: ['spit_up', 'swallow'],
  torment: ['counter', 'destiny_bond', 'grudge', 'metal_burst', 'mirror_coat', 'spite'],
};

type ContestData = {
  appeal: number;
  jam: number;
  effectTags: Array<StudioMoveContestEffectTag>;
  coolMoves: Array<string>;
  beautifulMoves: Array<string>;
  cuteMoves: Array<string>;
  cleverMoves: Array<string>;
  toughMoves: Array<string>;
  englishDescription: string;
  frenchDescription: string;
};

const contestData: Array<ContestData> = [
  {
    appeal: 4,
    jam: 0,
    effectTags: [],
    coolMoves: [
      'air_cutter',
      'brick_break',
      'cut',
      'dark_pulse',
      'dragon_claw',
      'fire_fang',
      'focus_blast',
      'force_palm',
      'horn_attack',
      'ice_fang',
      'iron_tail',
      'metal_claw',
      'peck',
      'psycho_cut',
      'razor_leaf',
      'rolling_kick',
      'shadow_claw',
      'slash',
      'spark',
      'thunder_fang',
      'thunder_punch',
      'thunder_shock',
      'thunderbolt',
      'twister',
      'vine_whip',
      'wing_attack',
    ],
    beautifulMoves: [
      'aqua_tail',
      'dazzling_gleam',
      'dragon_pulse',
      'earth_power',
      'energy_ball',
      'fairy_wind',
      'flamethrower',
      'flash_cannon',
      'ice_punch',
      'powder_snow',
      'power_gem',
    ],
    cuteMoves: ['bubble', 'egg_bomb', 'ember', 'return', 'water_gun'],
    cleverMoves: ['absorb', 'confusion', 'gear_grind', 'helping_hand', 'needle_arm', 'poison_fang', 'psychic', 'shadow_ball', 'zen_headbutt'],
    toughMoves: [
      'fire_punch',
      'headbutt',
      'iron_head',
      'karate_chop',
      'mud_shot',
      'poison_jab',
      'pound',
      'rock_smash',
      'rock_throw',
      'scratch',
      'seed_bomb',
      'slam',
      'smog',
      'stomp',
      'strength',
      'struggle',
      'tackle',
      'vice_grip',
      'waterfall',
    ],
    englishDescription: 'Quite an appealing move.',
    frenchDescription: 'Une Démonstration qui plaît énormément.',
  },
  {
    appeal: 8,
    jam: 0,
    effectTags: ['cant_act_anymore'],
    coolMoves: [],
    beautifulMoves: ['explosion', 'healing_wish', 'lunar_dance', 'self_destruct'],
    cuteMoves: [],
    cleverMoves: ['destiny_bond'],
    toughMoves: ['final_gambit', 'memento'],
    englishDescription: 'A move of huge appeal, but using it prevents the user from taking further contest moves.',
    frenchDescription: "Plaît énormément, mais interdit d'effectuer la moindre Démonstration jusqu'à la fin.",
  },
  {
    appeal: 6,
    jam: 0,
    effectTags: ['more_nervous'],
    coolMoves: ['brave_bird', 'flare_blitz', 'high_jump_kick', 'jump_kick', 'outrage', 'submission', 'v_create', 'volt_tackle'],
    beautifulMoves: [
      'draco_meteor',
      'dragon_ascent',
      'eruption',
      'leaf_storm',
      'light_of_ruin',
      'overheat',
      'petal_dance',
      'seed_flare',
      'spacial_rend',
      'water_spout',
    ],
    cuteMoves: ['belly_drum'],
    cleverMoves: ['psycho_boost'],
    toughMoves: [
      'close_combat',
      'double_edge',
      'hammer_arm',
      'head_charge',
      'head_smash',
      'superpower',
      'take_down',
      'thrash',
      'wild_charge',
      'wood_hammer',
    ],
    englishDescription: 'A very appealing move, but after using this move, the user is more easily startled.',
    frenchDescription: 'Une Démonstration très plaisante, mais le Pokémon sera aisément effrayé par la suite.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['compare_previous_appeal'],
    coolMoves: ['cross_chop', 'drill_peck', 'night_slash', 'razor_wind', 'retaliate', 'sky_attack', 'solar_beam', 'steel_wing'],
    beautifulMoves: ['avalanche', 'flame_wheel', 'freeze_shock', 'ice_burn'],
    cuteMoves: [],
    cleverMoves: [],
    toughMoves: ['brine', 'dragon_rush', 'drill_run', 'skull_bash', 'smelling_salts', 'stone_edge', 'wake_up_slap'],
    englishDescription: "Affected by how well the previous Pokémon's move went.",
    frenchDescription: 'Dépend de la façon dont la Démonstration du Pokémon précédent se passe.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['repeatable'],
    coolMoves: [
      'blaze_kick',
      'dragon_rage',
      'fury_cutter',
      'hyper_fang',
      'leaf_blade',
      'leaf_tornado',
      'megahorn',
      'meteor_mash',
      'night_daze',
      'psystrike',
      'razor_shell',
      'searing_shot',
      'sonic_boom',
      'triple_kick',
    ],
    beautifulMoves: ['blue_flare', 'bolt_strike', 'echoed_voice', 'freeze_dry', 'judgment', 'mystical_fire', 'secret_sword', 'weather_ball'],
    cuteMoves: ['heart_stamp', 'present', 'rollout'],
    cleverMoves: ['attack_order', 'hidden_power', 'kinesis', 'night_shade', 'transform'],
    toughMoves: ['bone_club', 'crabhammer', 'crush_grip', 'mega_punch', 'octazooka', 'seismic_toss', 'steamroller'],
    englishDescription: 'An appealing move that can be used repeatedly without boring the audience.',
    frenchDescription: 'Peut être utilisé plusieurs fois sans ennuyer le public.',
  },
  {
    appeal: 1,
    jam: 3,
    effectTags: ['jam_all'],
    coolMoves: ['mat_block', 'thunder_wave'],
    beautifulMoves: ['blizzard', 'spore'],
    cuteMoves: [],
    cleverMoves: ['eerie_impulse', 'hypnosis', 'metal_sound', 'nightmare', 'sleep_powder'],
    toughMoves: ['glare', 'rage'],
    englishDescription: 'Badly startles all of the Pokémon to act before the user.',
    frenchDescription: 'Effraie beaucoup tous les Pokémon qui ont fait leur Démonstration.',
  },
  {
    appeal: 2,
    jam: 1,
    effectTags: ['jam_all'],
    coolMoves: ['guillotine', 'horn_drill', 'zap_cannon'],
    beautifulMoves: ['hail', 'sheer_cold'],
    cuteMoves: [],
    cleverMoves: ['forest_s_curse', 'mist_ball', 'stun_spore'],
    toughMoves: ['earthquake', 'fissure', 'gunk_shot', 'hurricane', 'sandstorm', 'spite', 'super_fang'],
    englishDescription: 'Badly startles all Pokémon that successfully showed their appeal.',
    frenchDescription: 'Effraie beaucoup tous les Pokémon qui ont eu du succès.',
  },
  {
    appeal: 2,
    jam: 1,
    effectTags: ['jam_highest_score'],
    coolMoves: ['dynamic_punch', 'leer', 'punishment'],
    beautifulMoves: ['cotton_spore', 'electroweb'],
    cuteMoves: ['charm', 'soak', 'uproar'],
    cleverMoves: ['confuse_ray', 'taunt'],
    toughMoves: ['sludge_bomb', 'smack_down', 'sticky_web', 'wring_out'],
    englishDescription: 'Badly startles Pokémon that the audience has high expectations of.',
    frenchDescription: "Effraie énormément le Pokémon qui a l'attention du public.",
  },
  {
    appeal: 2,
    jam: 1,
    effectTags: ['jam_same_condition'],
    coolMoves: ['cross_poison', 'double_hit', 'double_kick', 'extrasensory', 'sky_uppercut', 'twineedle', 'x_scissor'],
    beautifulMoves: ['acid_spray', 'thousand_arrows'],
    cuteMoves: ['entrainment', 'nuzzle', 'trick_or_treat'],
    cleverMoves: ['electrify', 'foresight', 'heal_order', 'hex', 'luster_purge', 'pursuit', 'switcheroo', 'trick'],
    toughMoves: ['bonemerang', 'dual_chop'],
    englishDescription: 'Badly startles Pokémon that used a move of the same type.',
    frenchDescription: 'Effraie énormément les Pokémon qui ont fait une Démonstration du même type.',
  },
  {
    appeal: 1,
    jam: 4,
    effectTags: ['jam_previous'],
    coolMoves: ['air_slash', 'crush_claw'],
    beautifulMoves: ['bug_buzz', 'ice_beam', 'inferno', 'moonblast', 'psyshock'],
    cuteMoves: [],
    cleverMoves: ['giga_drain'],
    toughMoves: ['body_slam', 'crunch'],
    englishDescription: 'Badly startles the last Pokémon to act before the user.',
    frenchDescription: 'Effraie beaucoup le Pokémon qui vient de faire sa Démonstration.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['lower_others_condition'],
    coolMoves: [],
    beautifulMoves: ['haze'],
    cuteMoves: ['bug_bite', 'chatter', 'confide', 'fling', 'mud_slap', 'play_rough', 'pluck', 'simple_beam', 'swagger', 'tickle'],
    cleverMoves: ['acid', 'embargo', 'poison_powder', 'poison_tail', 'toxic', 'venom_drench'],
    toughMoves: ['constrict', 'gastro_acid', 'scary_face', 'sludge_wave', 'thousand_waves'],
    englishDescription: 'Brings down the energy of any Pokémon that have already used a move this turn.',
    frenchDescription: 'Diminue la confiance des Pokémon qui ont fait leur Démonstration.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['play_first_next_turn'],
    coolMoves: ['agility', 'aqua_jet', 'extreme_speed', 'mach_punch', 'quick_attack', 'tailwind', 'vacuum_wave', 'water_shuriken'],
    beautifulMoves: ['ice_shard'],
    cuteMoves: ['baby_doll_eyes'],
    cleverMoves: ['feint', 'lock_on', 'me_first', 'mind_reader', 'quash', 'shadow_sneak'],
    toughMoves: ['bullet_punch', 'rock_polish'],
    englishDescription: 'Causes the user to move earlier on the next turn.',
    frenchDescription: 'Permet de faire la prochaine Démonstration plus tôt au tour suivant.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['play_last_next_turn'],
    coolMoves: ['circle_throw', 'roar'],
    beautifulMoves: [],
    cuteMoves: ['after_you'],
    cleverMoves: ['whirlwind'],
    toughMoves: ['bide', 'curse', 'dragon_tail', 'endure'],
    englishDescription: 'Causes the user to move later on the next turn.',
    frenchDescription: 'Permet de faire la prochaine Démonstration plus tard au tour suivant.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['randomize_next_turn_order'],
    coolMoves: [],
    beautifulMoves: [],
    cuteMoves: [],
    cleverMoves: ['ally_switch', 'topsy_turvy', 'trick_room', 'wonder_room'],
    toughMoves: [],
    englishDescription: 'Scrambles the order in which Pokémon will move on the next turn.',
    frenchDescription: "Mélange l'ordre de passage des Démonstrations du prochain tour.",
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['random_appeal'],
    coolMoves: ['bullet_seed', 'fury_attack', 'pin_missile', 'spike_cannon'],
    beautifulMoves: ['icicle_spear', 'moonlight', 'morning_sun', 'tri_attack'],
    cuteMoves: ['assist', 'barrage', 'double_slap', 'metronome', 'sleep_talk', 'tail_slap'],
    cleverMoves: ['psywave', 'synthesis'],
    toughMoves: ['acupressure', 'arm_thrust', 'bone_rush', 'comet_punch', 'fury_swipes', 'rock_blast'],
    englishDescription: 'Effectiveness varies depending on when it is used.',
    frenchDescription: 'Une Démonstration qui plaît plus ou moins selon le moment où elle est exécutée.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['very_exciting_first'],
    coolMoves: ['electro_ball'],
    beautifulMoves: ['grassy_terrain', 'misty_terrain', 'origin_pulse'],
    cuteMoves: [],
    cleverMoves: ['crafty_shield', 'electric_terrain', 'hyperspace_hole', 'sucker_punch'],
    toughMoves: ['hyperspace_fury', 'work_up'],
    englishDescription: 'Excites the audience a lot if used first.',
    frenchDescription: 'Rend le public très enthousiaste si cette Démonstration est effectuée au départ.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['very_exciting_last'],
    coolMoves: ['aeroblast', 'parting_shot', 'precipice_blades'],
    beautifulMoves: ['diamond_storm', 'doom_desire', 'icicle_crash', 'sacred_fire', 'steam_eruption'],
    cuteMoves: ['wish'],
    cleverMoves: [],
    toughMoves: ['heat_crash', 'heavy_slam', 'shell_smash'],
    englishDescription: 'Excites the audience a lot if used last.',
    frenchDescription: 'Rend le public très enthousiaste si cette Démonstration est effectuée à la fin.',
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['always_exciting'],
    coolMoves: ['sacred_sword', 'storm_throw'],
    beautifulMoves: ['fire_pledge', 'grass_pledge', 'heal_pulse', 'water_pledge'],
    cuteMoves: ['celebrate', 'happy_hour', 'mud_sport', 'water_sport'],
    cleverMoves: ['pay_day'],
    toughMoves: ['chip_away', 'flying_press'],
    englishDescription: 'Excites the audience in any kind of contest.',
    frenchDescription: 'Une Démonstration qui enthousiasme le public de tous les concours.',
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['raise_condition'],
    coolMoves: ['bulk_up', 'double_team', 'dragon_dance', 'focus_energy'],
    beautifulMoves: [
      'aqua_ring',
      'aromatic_mist',
      'autotomize',
      'cosmic_power',
      'geomancy',
      'growth',
      'meditate',
      'ominous_wind',
      'quiver_dance',
      'silver_wind',
      'swords_dance',
      'tail_glow',
    ],
    cuteMoves: ['hone_claws', 'lucky_chant', 'sharpen'],
    cleverMoves: ['calm_mind', 'charge', 'ingrain', 'leech_seed', 'magnetic_flux', 'nasty_plot', 'shift_gear'],
    toughMoves: ['ancient_power', 'coil', 'rototiller', 'stockpile'],
    englishDescription: 'Gets the Pokémon pumped up. Helps prevent nervousness, too.',
    frenchDescription: 'Augmente la confiance du Pokémon et diminue sa nervosité.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['cancel_others_combo'],
    coolMoves: [],
    beautifulMoves: ['flame_burst', 'flash', 'psybeam', 'signal_beam', 'water_pulse', 'will_o_wisp'],
    cuteMoves: ['dizzy_punch', 'sand_attack'],
    cleverMoves: ['poison_gas', 'rock_tomb', 'screech', 'supersonic'],
    toughMoves: ['incinerate', 'rock_climb'],
    englishDescription: 'Makes audience expect little of other contestants.',
    frenchDescription: "Détourne l'attention du public des autres Pokémon.",
  },
  {
    appeal: 4,
    jam: 0,
    effectTags: ['can_reset_excitement'],
    coolMoves: ['false_swipe', 'hold_back', 'volt_switch'],
    beautifulMoves: ['frost_breath', 'icy_wind', 'lovely_kiss', 'perish_song'],
    cuteMoves: ['captivate', 'fake_tears', 'slack_off', 'snore', 'splash', 'u_turn'],
    cleverMoves: ['powder', 'roost'],
    toughMoves: ['snarl'],
    englishDescription: 'Makes the audience quickly grow bored when an appeal move has little effect.',
    frenchDescription: 'Si la Démonstration ne correspond pas au concours, le public perd tout enthousiasme.',
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['try_make_nervous'],
    coolMoves: ['stealth_rock'],
    beautifulMoves: ['mean_look', 'relic_song'],
    cuteMoves: ['attract', 'block', 'encore', 'sing', 'sweet_kiss', 'yawn'],
    cleverMoves: ['dark_void', 'disable', 'flatter', 'gravity', 'magnet_rise', 'spider_web', 'spikes', 'telekinesis', 'toxic_spikes', 'worry_seed'],
    toughMoves: ['scald', 'torment'],
    englishDescription: 'Makes the remaining Pokémon nervous.',
    frenchDescription: 'Rend nerveux tous les Pokémon qui font une Démonstration après celle-ci.',
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['prevent_jam_one_time'],
    coolMoves: [],
    beautifulMoves: ['dive', 'light_screen', 'safeguard'],
    cuteMoves: ['defense_curl', 'protect', 'refresh', 'substitute', 'sweet_scent', 'withdraw'],
    cleverMoves: ['defend_order', 'fly', 'grass_whistle', 'odor_sleuth', 'reflect'],
    toughMoves: ['dig', 'harden', 'swallow'],
    englishDescription: 'Prevents the user from being startled one time this turn.',
    frenchDescription: "Évite une fois d'être effrayé par un autre Pokémon.",
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['prevent_jam_one_turn'],
    coolMoves: ['barrier', 'detect', 'king_s_shield', 'phantom_force', 'shadow_force', 'teleport'],
    beautifulMoves: ['flower_shield', 'heal_bell', 'mist'],
    cuteMoves: ['amnesia', 'bounce', 'cotton_guard', 'hold_hands', 'minimize', 'rest'],
    cleverMoves: ['aromatherapy'],
    toughMoves: ['acid_armor', 'iron_defense', 'spiky_shield', 'wide_guard'],
    englishDescription: 'Prevents the user from being startled until the turn ends.',
    frenchDescription: "Évite d'être effrayé par les autres Pokémon.",
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['bonus_half_previous_appeals'],
    coolMoves: ['oblivion_wing'],
    beautifulMoves: [],
    cuteMoves: ['draining_kiss'],
    cleverMoves: ['camouflage', 'guard_split', 'guard_swap', 'heart_swap', 'pain_split', 'parabolic_charge', 'power_split', 'power_swap'],
    toughMoves: ['drain_punch', 'horn_leech', 'thief'],
    englishDescription: "Shows off the Pokémon's appeal about as well as all the moves before it this turn.",
    frenchDescription: 'Une Démonstration aussi réussie que celles des Pokémon précédents.',
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['copy_previous_appeal'],
    coolMoves: [],
    beautifulMoves: [],
    cuteMoves: ['copycat', 'covet', 'mimic', 'role_play'],
    cleverMoves: ['foul_play', 'leech_life', 'mirror_move', 'recycle', 'sketch', 'skill_swap', 'snatch'],
    toughMoves: [],
    englishDescription: "Shows off the Pokémon's appeal about as well as the move used just before it.",
    frenchDescription: 'Une Démonstration aussi réussie que celle du Pokémon précédent.',
  },
  {
    appeal: 2,
    jam: 2,
    effectTags: ['jam_all'],
    coolMoves: ['hyper_voice'],
    beautifulMoves: ['discharge', 'heat_wave', 'land_s_wrath', 'petal_blizzard', 'surf'],
    cuteMoves: [],
    cleverMoves: [],
    toughMoves: ['bulldoze', 'lava_plume', 'muddy_water', 'rock_slide'],
    englishDescription: 'Startles all of the Pokémon to act before the user.',
    frenchDescription: 'Effraie tous les Pokémon qui ont fait leur Démonstration.',
  },
  {
    appeal: 4,
    jam: 4,
    effectTags: ['jam_all', 'skip_next_turn'],
    coolMoves: ['frenzy_plant', 'hyper_beam'],
    beautifulMoves: ['blast_burn', 'hydro_cannon', 'roar_of_time'],
    cuteMoves: ['teeter_dance'],
    cleverMoves: [],
    toughMoves: ['boomburst', 'giga_impact', 'grudge', 'rock_wrecker'],
    englishDescription: 'Startles all other Pokémon. User cannot act in the next turn.',
    frenchDescription: 'Bloque tous les autres Pokémon, mais perd un tour de Démonstration.',
  },
  {
    appeal: 2,
    jam: 3,
    effectTags: ['jam_previous'],
    coolMoves: ['dragon_breath'],
    beautifulMoves: ['aurora_beam', 'bubble_beam', 'mirror_shot'],
    cuteMoves: ['astonish', 'fake_out', 'frustration', 'lick', 'mud_bomb'],
    cleverMoves: ['gust', 'knock_off', 'low_sweep', 'mega_drain', 'poison_sting', 'smokescreen', 'string_shot'],
    toughMoves: ['bite', 'sludge'],
    englishDescription: 'Startles the last Pokémon to act before the user.',
    frenchDescription: 'Effraie le Pokémon qui vient de faire sa Démonstration.',
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['lock_excitement'],
    coolMoves: [],
    beautifulMoves: ['fire_spin', 'glaciate', 'ice_ball', 'ion_deluge', 'whirlpool'],
    cuteMoves: ['follow_me', 'infestation'],
    cleverMoves: ['fairy_lock', 'heal_block', 'imprison', 'magic_room', 'rage_powder', 'sand_tomb'],
    toughMoves: ['bind', 'clamp', 'magma_storm', 'sky_drop', 'wrap'],
    englishDescription: 'Temporarily stops the crowd from growing excited.',
    frenchDescription: 'Rend le public moins enthousiaste pendant un certain temps après cette Démonstration.',
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['bonus_later'],
    coolMoves: ['fusion_bolt', 'gyro_ball', 'reversal', 'trump_card'],
    beautifulMoves: ['fusion_flare'],
    cuteMoves: ['flail', 'grass_knot'],
    cleverMoves: ['assurance'],
    toughMoves: ['low_kick'],
    englishDescription: 'Works better the later it is used in a turn.',
    frenchDescription: "Une Démonstration d'autant plus réussie qu'elle est lancée tard.",
  },
  {
    appeal: 3,
    jam: 0,
    effectTags: ['bonus_excitement'],
    coolMoves: ['fell_stinger', 'mega_kick', 'rapid_spin', 'thunder'],
    beautifulMoves: ['fire_blast', 'hydro_pump', 'nature_power', 'rain_dance', 'sunny_day'],
    cuteMoves: ['bestow', 'play_nice'],
    cleverMoves: ['natural_gift'],
    toughMoves: ['magnitude', 'power_whip'],
    englishDescription: 'Works better the more the crowd is excited.',
    frenchDescription: 'Une Démonstration qui plaît plus si le public est enthousiaste.',
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['bonus_first'],
    coolMoves: ['aerial_ace', 'defog', 'magnet_bomb', 'quick_guard', 'shock_wave', 'swift'],
    beautifulMoves: ['aura_sphere', 'clear_smog', 'magical_leaf'],
    cuteMoves: ['disarming_voice', 'milk_drink', 'soft_boiled'],
    cleverMoves: ['feint_attack', 'miracle_eye', 'shadow_punch'],
    toughMoves: ['noble_roar'],
    englishDescription: 'Works great if the user goes first this turn.',
    frenchDescription: "Une Démonstration qui plaît beaucoup si on l'exécute en premier.",
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['bonus_last'],
    coolMoves: ['howl', 'metal_burst', 'vital_throw'],
    beautifulMoves: ['feather_dance', 'magic_coat', 'mirror_coat'],
    cuteMoves: ['facade', 'growl', 'struggle_bug', 'tail_whip'],
    cleverMoves: ['psycho_shift'],
    toughMoves: ['counter', 'endeavor', 'focus_punch', 'payback', 'revenge'],
    englishDescription: 'Works great if the user goes last this turn.',
    frenchDescription: "Une Démonstration d'autant plus réussie qu'elle est lancée tard.",
  },
  {
    appeal: 2,
    jam: 0,
    effectTags: ['bonus_same_condition_previous'],
    coolMoves: [],
    beautifulMoves: ['conversion', 'conversion_2', 'round', 'venoshock'],
    cuteMoves: [],
    cleverMoves: ['dream_eater', 'future_sight', 'power_trick', 'psych_up', 'recover', 'reflect_type', 'synchronoise'],
    toughMoves: [],
    englishDescription: 'Works well if it is the same type as the move used by the last Pokémon.',
    frenchDescription: 'Une Démonstration qui plaît si elle est du même type que celle du Pokémon précédent.',
  },
  {
    appeal: 1,
    jam: 0,
    effectTags: ['bonus_raised_condition'],
    coolMoves: ['acrobatics', 'flame_charge', 'techno_blast'],
    beautifulMoves: ['charge_beam', 'fiery_dance'],
    cuteMoves: ['baton_pass', 'last_resort'],
    cleverMoves: ['beat_up', 'secret_power', 'stored_power'],
    toughMoves: ['belch', 'power_up_punch', 'spit_up'],
    englishDescription: 'Works well if the user is pumped up.',
    frenchDescription: 'Une Démonstration qui plaît énormément si le Pokémon est confiant.',
  },
];

const addDescriptionLine = (en: string, fr: string, amount: number): string[] => {
  return [en, fr, ...Array(amount).fill(en)];
};

const setMoveData = (move: StudioMoveDataBeforeMigration, descriptionTexts: string[][]): StudioMove => {
  let data = undefined;
  contestData.forEach((category) => {
    if (category.coolMoves.includes(move.dbSymbol)) {
      descriptionTexts.push(addDescriptionLine(category.englishDescription, category.frenchDescription, descriptionTexts[0].length - 2));
      data = {
        ...move,
        condition: 'cool',
        appeal: category.appeal,
        jam: category.jam,
        comboMoves: (combosData[move.dbSymbol] as DbSymbol[]) || [],
        effectTags: category.effectTags,
      };
    }
    if (category.beautifulMoves.includes(move.dbSymbol)) {
      descriptionTexts.push(addDescriptionLine(category.englishDescription, category.frenchDescription, descriptionTexts[0].length - 2));
      data = {
        ...move,
        condition: 'beautiful',
        appeal: category.appeal,
        jam: category.jam,
        comboMoves: (combosData[move.dbSymbol] as DbSymbol[]) || [],
        effectTags: category.effectTags,
      };
    }
    if (category.cuteMoves.includes(move.dbSymbol)) {
      descriptionTexts.push(addDescriptionLine(category.englishDescription, category.frenchDescription, descriptionTexts[0].length - 2));
      data = {
        ...move,
        condition: 'cute',
        appeal: category.appeal,
        jam: category.jam,
        comboMoves: (combosData[move.dbSymbol] as DbSymbol[]) || [],
        effectTags: category.effectTags,
      };
    }
    if (category.cleverMoves.includes(move.dbSymbol)) {
      descriptionTexts.push(addDescriptionLine(category.englishDescription, category.frenchDescription, descriptionTexts[0].length - 2));
      data = {
        ...move,
        condition: 'clever',
        appeal: category.appeal,
        jam: category.jam,
        comboMoves: (combosData[move.dbSymbol] as DbSymbol[]) || [],
        effectTags: category.effectTags,
      };
    }
    if (category.toughMoves.includes(move.dbSymbol)) {
      descriptionTexts.push(addDescriptionLine(category.englishDescription, category.frenchDescription, descriptionTexts[0].length - 2));
      data = {
        ...move,
        condition: 'tough',
        appeal: category.appeal,
        jam: category.jam,
        comboMoves: (combosData[move.dbSymbol] as DbSymbol[]) || [],
        effectTags: category.effectTags,
      };
    }
  });

  if (data === undefined) {
    //7G+ moves don't have contest data
    descriptionTexts.push(addDescriptionLine('Quite an appealing move.', 'Une Démonstration qui plaît énormément.', descriptionTexts[0].length - 2));
    return {
      ...move,
      condition: 'cool',
      appeal: 4,
      jam: 0,
      comboMoves: [],
      effectTags: [],
    };
  } else {
    return data;
  }
};

export const addMoveContestData = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const moves = await readProjectFolder(projectPath, 'moves');
  let sortedMoves: Array<z.SafeParseSuccess<StudioMoveDataBeforeMigration>> = [];
  await moves.reduce(async (lastPromise, move) => {
    await lastPromise;
    const moveParsed = PRE_MIGRATION_MOVE_VALIDATOR.safeParse(parseJSON<StudioMove>(move.data, move.filename));
    if (moveParsed.success) {
      sortedMoves.push(moveParsed);
    }
  }, Promise.resolve());

  const csvPath = path.join(projectPath, 'Data/Text/Dialogs');
  if (fs.existsSync(path.join(csvPath, `${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv`))) {
    throw new Error(`The file ${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv already exists. Please rename your file.`);
  }
  const movesDescriptions = await loadCSV(path.join(csvPath, `${MOVE_DESCRIPTION_TEXT_ID}.csv`));

  const descriptionTexts: string[][] = [movesDescriptions[0], movesDescriptions[1]];
  sortedMoves = sortedMoves.sort((a, b) => a.data.id - b.data.id);
  await sortedMoves.reduce(async (lastPromise, move) => {
    await lastPromise;
    const newMove = setMoveData(move.data, descriptionTexts);
    return fsPromise.writeFile(path.join(projectPath, 'Data/Studio/moves', `${newMove.dbSymbol}.json`), JSON.stringify(newMove, null, 2));
  }, Promise.resolve());

  await fsPromise.rm(path.join(projectPath, 'Data/Studio/moves/kotow_cleave.json')); // Remove wrongly named file coming from Gen 9 datapack

  saveCSV(path.join(csvPath, `${MOVE_CONTEST_DESCRIPTION_TEXT_ID}.csv`), descriptionTexts);
};
