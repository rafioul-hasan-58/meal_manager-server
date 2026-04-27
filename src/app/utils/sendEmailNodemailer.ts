
import nodemailer from "nodemailer";
import config from "../../config";

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    // host: "smtp.protonmail.ch",
    host: "mail.hasanmajedul.com",
    // service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
      // user: "support@deepbluedeal.com",
      // pass: "W21DY4ASM5BPP19B",
    },
    tls: {
      rejectUnauthorized: false,  // Optional: Bypass SSL issues if needed
    },
  });

  // Email options
  const mailOptions = {
    from: config.emailSender.email,
    // from: "support@deepbluedeal.com",
    to,
    subject,
    html,
    text,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

