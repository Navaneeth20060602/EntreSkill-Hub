const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, body }) {
  console.log("📧 About to send email to:", to);

  try {
    await transporter.sendMail({
      from: `"EntreSkill Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err);
    throw err;
  }
}

module.exports = { sendEmail };
