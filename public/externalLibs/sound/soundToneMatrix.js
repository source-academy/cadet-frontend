/*
  Support for CS1101S Mission 15
  Sound mission - Tone Matrix

  Author:
  v1 (2014/2015) Su Xuan - September 2014

  Modifier:
  v2 (2016/2017) Xiao Pu - September 2016 - fit source academy IDE
*/

var $tone_matrix // canvas container for tone matrix

var color_white = '#ffffff' // color of the highlighted square
var color_white_2 = '#666666' // color of the adjacent squares
var color_white_3 = '#444444' // color of the squares that are two units from the highlighted square
var color_on = '#cccccc'
var color_off = '#333333'

// the side length of the squares in the matrix
var square_side_length = 18

// the distance between two adjacent squares in the matrix
var distance_between_squares = 6

// margin of the canvas
var margin_length = 20

// the duration for playing one grid is 0.5s
var grid_duration = 0.5
// but the duration for playing one entire sound is 1 (which means there will be reverberations)
var sound_duration = 1

// for playing the tone matrix repeatedly in play_matrix_continuously function
var timeout_matrix
// for coloring the matrix accordingly while it's being played
var timeout_color

var timeout_objects = new Array()

// given the x, y coordinates of a "click" event
// return the row and column numbers of the clicked square
function x_y_to_row_column(x, y) {
  var row = Math.floor((y - margin_length) / (square_side_length + distance_between_squares))
  var column = Math.floor((x - margin_length) / (square_side_length + distance_between_squares))
  return Array(row, column)
}

// given the row number of a square, return the leftmost coordinate
function row_to_y(row) {
  return margin_length + row * (square_side_length + distance_between_squares)
}

// given the column number of a square, return the topmost coordinate
function column_to_x(column) {
  return margin_length + column * (square_side_length + distance_between_squares)
}

// return a list representing a particular row
function get_row(row) {
  return vector_to_list(matrix[row])
}

// return a list representing a particular column
function get_column(column) {
  var result = new Array(16)
  for (var i = 15; i >= 0; i--) {
    result[i] = matrix[i][column]
  }
  return vector_to_list(result)
}

function is_on(row, column) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return
  }

  return matrix[row][column]
}

// set the color of a particular square
function set_color(row, column, color) {
  if (row < 0 || row > 15 || column < 0 || column > 15) {
    return
  }

  var ctx = $tone_matrix.getContext('2d')
  ctx.fillStyle = color

  ctx.fillRect(column_to_x(column), row_to_y(row), square_side_length, square_side_length)
}

// highlight a given square
function highlight_color(row, column, color) {
  set_color(row, column, color)
}

// given the square that we are supposed to highlight, color the neighboring squares
function set_adjacent_color_1(row, column, color) {
  if (!is_on(row, column - 1)) {
    set_color(row, column - 1, color)
  }

  if (!is_on(row, column + 1)) {
    set_color(row, column + 1, color)
  }

  if (!is_on(row - 1, column)) {
    set_color(row - 1, column, color)
  }

  if (!is_on(row + 1, column)) {
    set_color(row + 1, column, color)
  }
}

// given the square that we are supposed to highlight, color the squares 2 units from it
function set_adjacent_color_2(row, column, color) {
  if (!is_on(row, column - 2)) {
    set_color(row, column - 2, color)
  }

  if (!is_on(row + 1, column - 1)) {
    set_color(row + 1, column - 1, color)
  }

  if (!is_on(row + 2, column)) {
    set_color(row + 2, column, color)
  }

  if (!is_on(row + 1, column + 1)) {
    set_color(row + 1, column + 1, color)
  }

  if (!is_on(row, column + 2)) {
    set_color(row, column + 2, color)
  }

  if (!is_on(row - 1, column + 1)) {
    set_color(row - 1, column + 1, color)
  }

  if (!is_on(row - 2, column)) {
    set_color(row - 2, column, color)
  }

  if (!is_on(row - 1, column - 1)) {
    set_color(row - 1, column - 1, color)
  }
}

// redraw a matrix according to the current state of the matrix
function redraw_matrix() {
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      if (matrix[i][j]) {
        set_color(i, j, color_on)
      } else {
        set_color(i, j, color_off)
      }
    }
  }
}

var ToneMatrix = {}

function initialise_matrix($container) {
  if (!$tone_matrix) {
    $tone_matrix = document.createElement('canvas')
    $tone_matrix.width = 420
    $tone_matrix.height = 420
    // the array representing the configuration of the matrix
    matrix = new Array(16)

    // the visualisation of the matrix itself
    var ctx = $tone_matrix.getContext('2d')

    // draw the initial matrix
    for (var i = 15; i >= 0; i--) {
      matrix[i] = new Array(16)
      for (var j = 15; j >= 0; j--) {
        set_color(i, j, color_off)
        matrix[i][j] = false
      }
    }

    bind_events_to_rect($tone_matrix)
  }
  $tone_matrix.hidden = false
  $container.appendChild($tone_matrix)
}
ToneMatrix.initialise_matrix = initialise_matrix

// bind the click events to the matrix
function bind_events_to_rect(c) {
  c.addEventListener(
    'click',
    function(event) {
      // calculate the x, y coordinates of the click event
      var offset_left = $(this).offset().left
      var offset_top = $(this).offset().top
      var x = event.pageX - offset_left
      var y = event.pageY - offset_top

      // obtain the row and column numbers of the square clicked
      var row_column = x_y_to_row_column(x, y)
      var row = row_column[0]
      var column = row_column[1]

      if (row < 0 || row > 15 || column < 0 || column > 15) {
        return
      }

      if (matrix[row][column] == undefined || !matrix[row][column]) {
        matrix[row][column] = true
        set_color(row, column, color_on)
      } else {
        matrix[row][column] = false
        set_color(row, column, color_off)
      }
    },
    false
  )
}

function random_animate() {
  for (var i = 5; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16)
    var column = Math.floor(Math.random() * 16)
    if (!is_on(row, column)) {
      set_color(row, column, color_white_3)
    }
  }

  for (var i = 10; i >= 0; i--) {
    var row = Math.floor(Math.random() * 16)
    var column = Math.floor(Math.random() * 16)
    if (!is_on(row, column)) {
      set_color(row, column, color_off)
    }
  }
}

function animate_column(n) {
  if (n < 0 || n > 15) {
    return
  }

  var column = list_to_vector(get_column(n))

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      // if a particular square is clicked, highlight itself
      // and the neighboring squares in the animation
      highlight_color(j, n, color_white)
      set_adjacent_color_1(j, n, color_white_2)
      set_adjacent_color_2(j, n, color_white_3)
    }
  }
}

function unanimate_column(n) {
  if (n < 0 || n > 15) {
    return
  }

  var column = list_to_vector(get_column(n))

  for (var j = 0; j <= 15; j++) {
    if (column[j]) {
      highlight_color(j, n, color_on)
      set_adjacent_color_1(j, n, color_off)
      set_adjacent_color_2(j, n, color_off)
    }
  }
}

// generate a randomised matrix
function randomise_matrix() {
  var ctx = $tone_matrix.getContext('2d')
  var on // the square in the matrix is on or off

  clear_matrix()
  // draw the randomised matrix
  for (var i = 15; i >= 0; i--) {
    for (var j = 15; j >= 0; j--) {
      on = Math.random() > 0.9
      if (on) {
        set_color(i, j, color_on)
        matrix[i][j] = true
      } else {
        set_color(i, j, color_off)
        matrix[i][j] = false
      }
    }
  }
}
ToneMatrix.randomise_matrix = randomise_matrix

function bindMatrixButtons() {
  $('#clear-matrix').on('click', function() {
    clear_matrix()
    // stop_matrix();
    $('#play-matrix').attr('value', 'Play')
  })

  // $("#play-matrix").on("click", function () {
  //     if ($(this).attr("value") == "Play") {
  //         $(this).attr("value", "Stop");
  //         play_matrix_continuously();
  //     } else {
  //         $(this).attr("value", "Play");
  //         // stop_matrix();
  //         redraw_matrix();
  //     }
  // });

  // $("#random-matrix").on("click", function () {
  //     randomise_matrix();
  // });
}
ToneMatrix.bindMatrixButtons = bindMatrixButtons

// ********** THE FOLLOWING FUNCTIONS ARE EXPOSED TO STUDENTS **********
// return the current state of the matrix, represented by a list of lists of bits
function get_matrix() {
  if (!matrix) {
    throw new Error('Please activate the tone matrix first by clicking on the tab!')
  }
  var matrix_list = matrix.slice(0)
  var result = []
  for (var i = 0; i <= 15; i++) {
    result[i] = vector_to_list(matrix_list[15 - i])
  }

  return vector_to_list(result)
}

// reset the matrix to the initial state
function clear_matrix() {
  matrix = new Array(16)
  var ctx = $tone_matrix.getContext('2d')

  // draw the initial matrix
  for (var i = 15; i >= 0; i--) {
    matrix[i] = new Array(16)
    for (var j = 15; j >= 0; j--) {
      set_color(i, j, color_off)
      matrix[i][j] = false
    }
  }
}

ToneMatrix.clear_matrix = clear_matrix

var set_time_out_renamed = window.setTimeout

function set_timeout(f, t) {
  var timeoutObj = set_time_out_renamed(f, t)
  timeout_objects.push(timeoutObj)
}

function clear_all_timeout() {
  for (var i = timeout_objects.length - 1; i >= 0; i--) {
    clearTimeout(timeout_objects[i])
  }

  timeout_objects = new Array()
}

// functions from mission 14
function letter_name_to_midi_note(note) {
  // we don't consider double flat/ double sharp
  var note = note.split('')
  var res = 12 //MIDI notes for mysterious C0
  var n = note[0].toUpperCase()
  switch (n) {
    case 'D':
      res = res + 2
      break

    case 'E':
      res = res + 4
      break

    case 'F':
      res = res + 5
      break

    case 'G':
      res = res + 7
      break

    case 'A':
      res = res + 9
      break

    case 'B':
      res = res + 11
      break

    default:
      break
  }

  if (note.length === 2) {
    res = parseInt(note[1]) * 12 + res
  } else if (note.length === 3) {
    switch (note[1]) {
      case '#':
        res = res + 1
        break

      case 'b':
        res = res - 1
        break

      default:
        break
    }
    res = parseInt(note[2]) * 12 + res
  }

  return res
}

function letter_name_to_frequency(note) {
  return midi_note_to_frequency(note_to_midi_note(note))
}

function midi_note_to_frequency(note) {
  return 8.1757989156 * Math.pow(2, note / 12)
}

function square_sourcesound(freq, duration) {
  function fourier_expansion_square(level, t) {
    var answer = 0
    for (var i = 1; i <= level; i++) {
      answer = answer + Math.sin(2 * Math.PI * (2 * i - 1) * freq * t) / (2 * i - 1)
    }
    return answer
  }
  return autocut_sourcesound(
    make_sourcesound(function(t) {
      var x = 4 / Math.PI * fourier_expansion_square(5, t)
      if (x > 1) {
        return 1
      } else if (x < -1) {
        return -1
      } else {
        return x
      }
    }, duration)
  )
}

function square_sound(freq, duration) {
  return sourcesound_to_sound(square_sourcesound(freq, duration))
}

function triangle_sourcesound(freq, duration) {
  function fourier_expansion_triangle(level, t) {
    var answer = 0
    for (var i = 0; i < level; i++) {
      answer =
        answer +
        Math.pow(-1, i) * Math.sin((2 * i + 1) * t * freq * Math.PI * 2) / Math.pow(2 * i + 1, 2)
    }
    return answer
  }
  return autocut_sourcesound(
    make_sourcesound(function(t) {
      var x = 8 / Math.PI / Math.PI * fourier_expansion_triangle(5, t)
      if (x > 1) {
        return 1
      } else if (x < -1) {
        return -1
      } else {
        return x
      }
    }, duration)
  )
}

function triangle_sound(freq, duration) {
  return sourcesound_to_sound(triangle_sourcesound(freq, duration))
}

function sawtooth_sourcesound(freq, duration) {
  function fourier_expansion_sawtooth(level, t) {
    var answer = 0
    for (var i = 1; i <= level; i++) {
      answer = answer + Math.sin(2 * Math.PI * i * freq * t) / i
    }
    return answer
  }
  return autocut_sourcesound(
    make_sourcesound(function(t) {
      var x = 1 / 2 - 1 / Math.PI * fourier_expansion_sawtooth(5, t)
      if (x > 1) {
        return 1
      } else if (x < -1) {
        return -1
      } else {
        return x
      }
    }, duration)
  )
}

function sawtooth_sound(freq, duration) {
  return sourcesound_to_sound(sawtooth_sourcesound(freq, duration))
}

function exponential_decay(decay_period) {
  return function(t) {
    if (t > decay_period || t < 0) {
      return undefined
    } else {
      var halflife = decay_period / 8
      var lambda = Math.log(2) / halflife
      return Math.pow(Math.E, -lambda * t)
    }
  }
}

function adsr(attack_time, decay_time, sustain_level, release_time) {
  return function(sound) {
    var sourcesound = sound_to_sourcesound(sound)
    var wave = get_wave(sourcesound)
    var duration = get_duration(sourcesound)
    return sourcesound_to_sound(
      make_sourcesound(function(x) {
        if (x < attack_time) {
          return wave(x) * (x / attack_time)
        } else if (x < attack_time + decay_time) {
          return (
            (exponential_decay(1 - sustain_level, decay_time)(x - attack_time) + sustain_level) *
            wave(x)
          )
        } else if (x < duration - release_time) {
          return wave(x) * sustain_level
        } else if (x <= duration) {
          return (
            wave(x) * sustain_level * exponential_decay(release_time)(x - (duration - release_time))
          )
        } else {
          return 0
        }
      }, duration)
    )
  }
}

function stacking_adsr(waveform, base_frequency, duration, list_of_envelope) {
  function zip(lst, n) {
    if (is_null(lst)) {
      return lst
    } else {
      return pair(pair(n, head(lst)), zip(tail(lst), n + 1))
    }
  }

  return simultaneously(
    accumulate(
      function(x, y) {
        return pair(tail(x)(waveform(base_frequency * head(x), duration)), y)
      },
      null,
      zip(list_of_envelope, 1)
    )
  )
}

// instruments for students
function trombone(note, duration) {
  return stacking_adsr(
    square_sound,
    midi_note_to_frequency(note),
    duration,
    list(adsr(0.4, 0, 1, 0), adsr(0.6472, 1.2, 0, 0))
  )
}

function piano(note, duration) {
  return stacking_adsr(
    triangle_sound,
    midi_note_to_frequency(note),
    duration,
    list(adsr(0, 1.03, 0, 0), adsr(0, 0.64, 0, 0), adsr(0, 0.4, 0, 0))
  )
}

function bell(note, duration) {
  return stacking_adsr(
    square_sound,
    midi_note_to_frequency(note),
    duration,
    list(adsr(0, 1.2, 0, 0), adsr(0, 1.3236, 0, 0), adsr(0, 1.5236, 0, 0), adsr(0, 1.8142, 0, 0))
  )
}

function violin(note, duration) {
  return stacking_adsr(
    sawtooth_sound,
    midi_note_to_frequency(note),
    duration,
    list(adsr(0.7, 0, 1, 0.3), adsr(0.7, 0, 1, 0.3), adsr(0.9, 0, 1, 0.3), adsr(0.9, 0, 1, 0.3))
  )
}

function cello(note, duration) {
  return stacking_adsr(
    square_sound,
    midi_note_to_frequency(note),
    duration,
    list(adsr(0.1, 0, 1, 0.2), adsr(0.1, 0, 1, 0.3), adsr(0, 0, 0.2, 0.3))
  )
}

function string_to_list_of_numbers(string) {
  var array_of_numbers = string.split('')
  return map(function(x) {
    return parseInt(x)
  }, vector_to_list(array_of_numbers))
}
