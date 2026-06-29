const WORKING_HOURS = {
  start: "09:00",
  end: "20:00"
};

const LUNCH_BREAK = {
  start: "12:30",
  end: "14:00"
};

const BUFFER_MINUTES = 15;

const TIMEZONE = "America/Sao_Paulo";

function getEnv() {
  return {
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID,
    adminEmail: process.env.ADMIN_EMAIL,
    whatsappNumber: process.env.WHATSAPP_NUMBER || "5511966818500"
  };
}

module.exports = {
  WORKING_HOURS,
  LUNCH_BREAK,
  BUFFER_MINUTES,
  TIMEZONE,
  getEnv
};
