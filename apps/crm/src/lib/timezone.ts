const parisDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedLocalMidnightUtc(year: number, month: number, day: number) {
  const localMidnightAsUtc = Date.UTC(year, month - 1, day);
  let candidate = localMidnightAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = parisDateTimeFormatter.formatToParts(new Date(candidate));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const zonedTimeAsUtc = Date.UTC(
      Number(values["year"]),
      Number(values["month"]) - 1,
      Number(values["day"]),
      Number(values["hour"]),
      Number(values["minute"]),
      Number(values["second"]),
    );
    const offset = zonedTimeAsUtc - Math.floor(candidate / 1000) * 1000;
    const adjusted = localMidnightAsUtc - offset;
    if (adjusted === candidate) break;
    candidate = adjusted;
  }

  return new Date(candidate);
}

export function nextParisMidnight(now: Date) {
  const parts = parisDateTimeFormatter.formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const nextCalendarDay = new Date(
    Date.UTC(Number(values["year"]), Number(values["month"]) - 1, Number(values["day"]) + 1),
  );

  return zonedLocalMidnightUtc(
    nextCalendarDay.getUTCFullYear(),
    nextCalendarDay.getUTCMonth() + 1,
    nextCalendarDay.getUTCDate(),
  );
}
