const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, body }) {
  await resend.emails.send({
    from: "EntreSkill Hub <onboarding@resend.dev>",
    to,
    subject,
    text: body,
  });
}

module.exports = { sendEmail };
