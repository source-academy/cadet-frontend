import * as moment from 'moment'

/**
 * Checks if a date is before or at the current time.
 *
 * @param {string} d an ISO 8601 compliant date string
 *   e.g 2018-07-06T10:20:09.961Z
 * @returns {boolean} true if the date specified by the paramter
 *   is before the time of execution of this function.
 */
export const beforeNow = (d: string): boolean => {
  return moment(d).isBefore(moment())
}

/**
 * Return a string representation of a date that is
 * nice to look at. To be used for displaying the date,
 * e.g when showing the assessment overview.
 *
 * @param {string} d an ISO 8601 compliant date string
 *   e.g 2018-07-06T10:20:09.961Z
 * @returns {string} A user-friendly readable date string,
 *   e.g 07/06, 20:09
 */
export const getPrettyDate = (d: string): string => {
  const date = moment(d)
  return date.format('DD/M, HH:mm')
}
