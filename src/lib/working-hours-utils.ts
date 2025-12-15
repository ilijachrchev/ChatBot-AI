import { toZonedTime, format } from 'date-fns-tz'

export type DaySchedule = {
  ranges: string[] 
  closed: boolean
}

export type WorkingHoursConfig = {
  enabled: boolean
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  timezone: string
}

export function isWithinWorkingHours(
  workingHours: WorkingHoursConfig,
  currentTime?: Date
): boolean {
  if (!workingHours.enabled) {
    return true 
  }

  const now = currentTime || new Date()
  
  const zonedTime = toZonedTime(now, workingHours.timezone)
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = dayNames[zonedTime.getDay()] as keyof Omit<WorkingHoursConfig, 'enabled' | 'timezone'>
  
  const daySchedule = workingHours[dayName]
  
  if (daySchedule.closed || daySchedule.ranges.length === 0) {
    return false
  }
  
  const currentTimeStr = format(zonedTime, 'HH:mm', { timeZone: workingHours.timezone })
  
  for (const range of daySchedule.ranges) {
    const [start, end] = range.split('-')
    
    if (currentTimeStr >= start && currentTimeStr <= end) {
      return true
    }
  }
  
  return false
}

export function getNextAvailableTime(
  workingHours: WorkingHoursConfig
): { day: string; time: string } | null {
  if (!workingHours.enabled) {
    return null
  }

  const now = new Date()
  const zonedTime = toZonedTime(now, workingHours.timezone)
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = zonedTime.getDay()
  
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7
    const dayName = dayNames[checkDay] as keyof Omit<WorkingHoursConfig, 'enabled' | 'timezone'>
    const daySchedule = workingHours[dayName]
    
    if (!daySchedule.closed && daySchedule.ranges.length > 0) {
      const firstRange = daySchedule.ranges[0]
      const [startTime] = firstRange.split('-')
      
      return {
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        time: startTime,
      }
    }
  }
  
  return null
}

export function formatWorkingHours(workingHours: WorkingHoursConfig): string {
  if (!workingHours.enabled) {
    return '24/7 Available'
  }

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const schedule: string[] = []
  
  for (const day of dayNames) {
    const daySchedule = workingHours[day as keyof Omit<WorkingHoursConfig, 'enabled' | 'timezone'>]
    
    if (daySchedule.closed) {
      schedule.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`)
    } else if (daySchedule.ranges.length > 0) {
      const ranges = daySchedule.ranges.map(range => {
        const [start, end] = range.split('-')
        return `${formatTime(start)} - ${formatTime(end)}`
      }).join(', ')
      
      schedule.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${ranges}`)
    }
  }
  
  return schedule.join('\n')
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export function getOfflineMessage(
  workingHours: WorkingHoursConfig,
  behavior: 'COLLECT_EMAIL' | 'SHOW_HOURS_AND_EMAIL' | 'AI_ONLY' | 'CUSTOM',
  customMessage?: string
): string {
  if (behavior === 'CUSTOM' && customMessage) {
    return customMessage
  }

  if (behavior === 'AI_ONLY') {
    return "We're currently outside of business hours, but our AI assistant is here to help you 24/7! Note: Human support will be available during our working hours."
  }

  const nextAvailable = getNextAvailableTime(workingHours)
  const hoursDisplay = formatWorkingHours(workingHours)
  
  if (behavior === 'SHOW_HOURS_AND_EMAIL') {
    return `We're currently offline. Our working hours:\n\n${hoursDisplay}\n\nLeave your email and we'll get back to you during business hours!`
  }

  return `We're currently offline${nextAvailable ? ` and will be back ${nextAvailable.day} at ${formatTime(nextAvailable.time)}` : ''}. Leave your email and we'll contact you as soon as possible!`
}