const { getCalendarClient } = require("./google");
const { BUFFER_MINUTES, TIMEZONE } = require("./config");

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const {
      clientName,
      clientPhone,
      clientInstagram,
      serviceName,
      duration,
      price,
      start,
      notes
    } = req.body || {};

    if (!clientName || !clientPhone || !serviceName || !duration || !start) {
      return res.status(400).json({ message: "Dados incompletos para o agendamento." });
    }

    const { calendar, calendarId } = getCalendarClient();

    const startDate = new Date(start);
    const endDate = addMinutes(startDate, Number(duration) + BUFFER_MINUTES);

    const event = {
      summary: `DutsNails | ${serviceName} - ${clientName}`,
      description:
        `Cliente: ${clientName}\n` +
        `WhatsApp: ${clientPhone}\n` +
        `Instagram: ${clientInstagram || "Não informado"}\n` +
        `Serviço: ${serviceName}\n` +
        `Valor: R$ ${price}\n` +
        `Duração: ${duration} minutos + ${BUFFER_MINUTES} minutos de intervalo\n` +
        `Observações: ${notes || "Sem observações"}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: TIMEZONE
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: TIMEZONE
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "popup", minutes: 24 * 60 }
        ]
      }
    };

    const created = await calendar.events.insert({
      calendarId,
      requestBody: event
    });

    return res.status(200).json({
      message: "Agendamento criado com sucesso.",
      eventId: created.data.id
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Erro ao criar agendamento."
    });
  }
};
