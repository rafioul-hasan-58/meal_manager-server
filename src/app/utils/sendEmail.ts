import nodemailer from "nodemailer";
import config from "../../config";

export const sendMail = async (
  to: string,
  otp?: number | string,
  resetPassLink?: string
) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: config.smtp.email,
      pass: config.smtp.pass,
    },
  });

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  // const clickableLink = `<a href="${confirmLink}" style="color: #121849; text-decoration: underline;">here</a>`;
  const clickableResetPass = `<a href="${resetPassLink}" style="color: #121849; text-decoration: underline;">here</a>`;

  const html = `
  <div style="max-width: 600px; margin: 0 auto; background-color: #000721; color: #333; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <div style="padding: 5px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <img src="https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png" alt="logo" style="height: 40px; margin-bottom: 16px;" />
          </div>
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>

    
    ${otp
      ? `<h2 style="text-align: center; color: #ffffff;">Verify Your OTP Within 05 Minutes</h2>
       <div style="padding: 0 1em;">
         <p style="text-align: center; line-height: 28px; color: #fff;">
           <strong style="color: #ffffff; font-size: 24px;">${otp}</strong>
         </p>
       </div>`
      : `<h2 style="text-align: center; color: #ffffff;">Reset Your Password Within 10 Minutes</h2>
       <div style="padding: 0 1em;">
         <p style="text-align: left; line-height: 28px; color: #fff;">
           <strong style="color: #ffffff;">Reset Link:</strong> Click ${clickableResetPass} to reset your password.
         </p>
       </div>`
    }
  </div>
  `;

  const res = await transporter.sendMail({
    from: `${config.smtp.name} < ${config.smtp.email_from}>`,
    to,
    subject: `${resetPassLink
      ? "Reset Your Password"
      : "Verify Your OTP within 05 Minutes"
      }`,
    text: "Hello world?",
    html: html,
  });
  return res;
};
