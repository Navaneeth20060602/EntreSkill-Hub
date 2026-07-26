// Mock email service. No real email provider (SendGrid/SES/etc.) is
// configured yet, so this just logs what would be sent. Swap the body of
// sendEmail() for a real provider call when ready to go live.
function sendEmail({ to, subject, body }) {
  console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}\n${body}`);
  return true;
}

module.exports = { sendEmail };
