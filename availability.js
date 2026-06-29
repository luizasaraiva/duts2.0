const { getCalendarClient } = require("./google");
const { WORKING_HOURS, LUNCH_BREAK, BUFFER_MINUTES, TIMEZONE } = require("./config");

function toDate(date, time) {
  return new Date(`${date}T${time}:00-03:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function formatTime(date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const { date, duration } = req.query;

    if (!date || !duration) {
      return res.status(400).json({ message: "Informe data e duração." });
    }

    const durationMinutes = Number(duration);
    const { calendar, calendarId } = getCalendarClient();

    const dayStart = toDate(date, "00:00");
    const dayEnd = toDate(date, "23:59");

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const busy = (eventsResponse.data.items || []).map(event => ({
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date)
    }));

    const workStart = toDate(date, WORKING_HOURS.start);
    const workEnd = toDate(date, WORKING_HOURS.end);
    const lunchStart = toDate(date, LUNCH_BREAK.start);
    const lunchEnd = toDate(date, LUNCH_BREAK.end);

    const slots = [];
    let cursor = new Date(workStart);

    while (addMinutes(cursor, durationMinutes) <= workEnd) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(slotStart, durationMinutes + BUFFER_MINUTES);

      const conflictWithEvents = busy.some(item => overlaps(slotStart, slotEnd, item.start, item.end));
      const conflictWithLunch = overlaps(slotStart, slotEnd, lunchStart, lunchEnd);
      const inPast = slotStart < new Date();

      if (!conflictWithEvents && !conflictWithLunch && !inPast) {
        slots.push({
          label: formatTime(slotStart),
          start: slotStart.toISOString(),
          end: addMinutes(slotStart, durationMinutes).toISOString()
        });
      }

      cursor = addMinutes(cursor, 30);
    }

    return res.status(200).json({ slots });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao buscar disponibilidade."
    });
  }
};
