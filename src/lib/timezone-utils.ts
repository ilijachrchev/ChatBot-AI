import { format, toZonedTime, fromZonedTime } from 'date-fns-tz'

/**
 * Convert a UTC date to user's timezone
 * @param utcDate - Date in UTC
 * @param timezone - User's timezone (e.g., 'America/New_York')
 * @returns Date in user's timezone
 */
export function convertUTCToUserTimezone(utcDate: Date, timezone: string): Date {
  return toZonedTime(utcDate, timezone)
}

/**
 * Convert a date from user's timezone to UTC
 * @param localDate - Date in user's timezone
 * @param timezone - User's timezone
 * @returns Date in UTC
 */
export function convertUserTimezoneToUTC(localDate: Date, timezone: string): Date {
  return fromZonedTime(localDate, timezone)
}

/**
 * Format a date in user's timezone
 * @param date - Date to format
 * @param timezone - User's timezone
 * @param formatString - Format string (default: 'PPp')
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  formatString: string = 'PPp'
): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, formatString, { timeZone: timezone })
}

/**
 * Get current time in user's timezone
 * @param timezone - User's timezone
 * @returns Current date in user's timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

/**
 * Check if a time is within working hours
 * @param currentTime - Current time in user's timezone
 * @param workingHoursStart - Start time (e.g., '09:00')
 * @param workingHoursEnd - End time (e.g., '17:00')
 * @param workingDays - Array of working days (e.g., ['monday', 'tuesday'])
 * @returns boolean
 */
export function isWithinWorkingHours(
  currentTime: Date,
  workingHoursStart: string,
  workingHoursEnd: string,
  workingDays: string[]
): boolean {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[currentTime.getDay()]

  if (!workingDays.includes(currentDay)) {
    return false
  }

  const currentTimeString = format(currentTime, 'HH:mm')

  return currentTimeString >= workingHoursStart && currentTimeString <= workingHoursEnd
}

/**
 * Get working hours message for chatbot
 * @param workingHoursStart - Start time
 * @param workingHoursEnd - End time
 * @param workingDays - Array of working days
 * @param timezone - User's timezone
 * @returns Formatted message
 */
export function getWorkingHoursMessage(
  workingHoursStart: string,
  workingHoursEnd: string,
  workingDays: string[],
  timezone: string
): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const dayAbbreviations: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  }

  const workingDaysFormatted = workingDays
    .map((day) => dayAbbreviations[day])
    .join(', ')

  const startFormatted = formatTime(workingHoursStart)
  const endFormatted = formatTime(workingHoursEnd)

  return `We're currently offline. Our working hours are ${workingDaysFormatted}, ${startFormatted} - ${endFormatted} ${timezone}. We'll get back to you as soon as we're available!`
}

/**
 * Create a date object from components in a specific timezone
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @param hours - Hours (0-23)
 * @param minutes - Minutes
 * @param timezone - Target timezone
 * @returns Date object representing that time in the specified timezone
 */
export function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  timezone: string
): Date {
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
  
  return fromZonedTime(dateString, timezone)
}