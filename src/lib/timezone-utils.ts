import { format, toZonedTime, fromZonedTime } from 'date-fns-tz'

export function convertUTCToUserTimezone(utcDate: Date, timezone: string): Date {
  return toZonedTime(utcDate, timezone)
}

export function convertUserTimezoneToUTC(localDate: Date, timezone: string): Date {
  return fromZonedTime(localDate, timezone)
}

export function formatInTimezone(
  date: Date,
  timezone: string,
  formatString: string = 'PPp'
): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, formatString, { timeZone: timezone })
}

export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}


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