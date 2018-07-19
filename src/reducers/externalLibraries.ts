/**
 * Defines all the externals for playground, i.e full access to runes functionality.
 */
const TwoDRunesExternals = [
  'show',
  'random_color',
  'red',
  'pink',
  'purple',
  'indigo',
  'blue',
  'green',
  'yellow',
  'orange',
  'brown',
  'black',
  'white',
  'scale_independent',
  'scale',
  'translate',
  'rotate',
  'stack_frac',
  'stack',
  'stackn',
  'quarter_turn_right',
  'quarter_turn_left',
  'turn_upside_down',
  'beside_frac',
  'beside',
  'flip_vert',
  'flip_horiz',
  'make_cross',
  'repeat_pattern',
  'black_bb',
  'blank_bb',
  'rcross_bb',
  'sail_bb',
  'corner_bb',
  'nova_bb',
  'circle_bb',
  'heart_bb',
  'pentagram_bb',
  'ribbon_bb'
]

/** Constants for external library names */
export enum ExternalLibraryNames {
  NONE,
  TWO_DIM_RUNES,
  THREE_DIM_RUNES,
  CURVES,
  SOUND
}

export type ExternalLibraryName = keyof typeof ExternalLibraryNames

/**
 * Defines which external libraries are available for usage, and what 
 * externals (exposed functions) are under them.
 */
const libEntries: Array<[string, string[]]> = [
  [ExternalLibraryNames.NONE, []],
  [ExternalLibraryNames.TWO_DIM_RUNES, TwoDRunesExternals],
  [
    ExternalLibraryNames.THREE_DIM_RUNES,
    [
      ...TwoDRunesExternals,
      'anaglyph',
      'hollusion',
      'animate',
      'stereogram',
      'overlay_frac',
      'overlay'
    ]
  ],
  [
    ExternalLibraryNames.CURVES,
    [
      'make_point',
      'draw_points_on',
      'draw_connected',
      'draw_points_squeezed_to_window',
      'draw_connected_squeezed_to_window',
      'draw_connected_full_view',
      'draw_connected_full_view_proportional',
      'x_of',
      'y_of',
      'unit_line',
      'unit_line_at',
      'unit_circle',
      'connect_rigidly',
      'connect_ends',
      'put_in_standard_position',
      'full_view_proportional',
      'squeeze_full_view',
      'squeeze_rectangular_portion'
    ]
  ],
  [
    ExternalLibraryNames.SOUND,
    [
      'make_sourcesound',
      'get_wave',
      'get_duration',
      'is_sound',
      'play',
      'stop',
      'cut_sourcesound',
      'cut',
      'autocut_sourcesound',
      'sourcesound_to_sound',
      'sound_to_sourcesound',
      'consecutively',
      'simultaneously',
      'noise_sourcesound',
      'noise',
      'sine_sourcesound',
      'sine_sound',
      'constant_sourcesound',
      'silence_sourcesound',
      'high_sourcesound',
      'silence',
      'high',
      'invert_sourcesound',
      'invert',
      'clamp_sourcesound',
      'clamp',
      'letter_name_to_midi_note',
      'letter_name_to_frequency',
      'midi_note_to_frequency',
      'square_sourcesound',
      'square_sound',
      'triangle_sourcesound',
      'triangle_sound',
      'sawtooth_sourcesound',
      'sawtooth_sound',
      'play_concurrently'
    ]
  ]
]

export const externalLibraries: Map<string, string[]> = new Map(libEntries)
