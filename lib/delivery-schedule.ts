export function isValidDeliverySchedule(
  date: string,
  time: string,
  now = Date.now(),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    return false;
  const calendarDate = new Date(`${date}T12:00:00Z`);
  if (
    !Number.isFinite(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== date
  )
    return false;
  // All delivery schedules are local to Legazpi City (UTC+08:00).
  return Date.parse(`${date}T${time}:00+08:00`) > now;
}
