const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, body }) {
  await transporter.sendMail({
    from: `"EntreSkill Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body,
  });
}

module.exports = { sendEmail };
