const { google } = require("googleapis");
const { getEnv } = require("./config");

function getCalendarClient() {
  const env = getEnv();

  if (!env.googleClientEmail || !env.googlePrivateKey || !env.googleCalendarId) {
    throw new Error("Google Calendar não configurado. Verifique as variáveis de ambiente.");
  }

  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  const calendar = google.calendar({ version: "v3", auth });

  return {
    calendar,
    calendarId: env.googleCalendarId
  };
}

module.exports = { getCalendarClient };
