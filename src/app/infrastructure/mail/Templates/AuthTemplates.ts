export const AuthTemplates = {
  otp: (otp: string | number, formattedDate: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 36px 48px 28px; border-bottom: 1px solid #e8edf2;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png"
                      alt="Meal Manager"
                      style="height: 36px; display: block;"
                    />
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94a3b8; letter-spacing: 0.3px;">${formattedDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 44px 48px 12px;">

              <!-- Tag line -->
              <p style="margin: 0 0 16px; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #2563eb;">
                Email Verification
              </p>

              <!-- Heading -->
              <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Confirm your email address
              </h1>

              <!-- Subtext -->
              <p style="margin: 0 0 36px; font-size: 15px; color: #64748b; line-height: 1.7;">
                Thanks for signing up for <strong style="color: #0f172a;">Meal Manager</strong>.
                Enter the code below in the verification screen to confirm your email address.
                This code expires in <strong style="color: #0f172a;">10 minutes</strong>.
              </p>

              <!-- OTP Label -->
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8;">
                Your verification code
              </p>

              <!-- OTP Code — clean, spaced, no boxes -->
              <p style="margin: 0 0 8px; font-size: 48px; font-weight: 700; letter-spacing: 14px; color: #2563eb; line-height: 1;">
                ${String(otp)}
              </p>

              <!-- Underline accent -->
              <div style="width: 56px; height: 3px; background-color: #2563eb; border-radius: 2px; margin-bottom: 40px;"></div>

              <!-- Security note -->
              <table cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 3px solid #e2e8f0; border-radius: 0 6px 6px 0; margin-bottom: 44px; width: 100%;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                      If you didn't create an account with Meal Manager, you can safely ignore this email.
                      Someone may have entered your email address by mistake.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 48px; border-top: 1px solid #e8edf2; background-color: #f8fafc;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                      © ${new Date().getFullYear()} Meal Manager. All rights reserved.<br/>
                      This is an automated message — please do not reply.
                    </p>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 11px; color: #cbd5e1; letter-spacing: 0.5px;">Secure Email</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Below card note -->
        <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          Need help? Contact us at
          <a href="mailto:support@mealmanager.com" style="color: #2563eb; text-decoration: none;">support@mealmanager.com</a>
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`,
  resetPassword: (resetLink: string, formattedDate: string) => `
  <div style="max-width: 600px; margin: 0 auto; background-color: #000721; color: #333; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <img src="https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png"
            alt="logo"
            style="height: 40px;" />
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>

    <h2 style="text-align: center; color: #ffffff;">
      Reset Your Password Within 10 Minutes
    </h2>

    <p style="color: #fff;">
      Click <a href="${resetLink}" style="color:#4da3ff;">here</a> to reset your password.
    </p>
  </div>
  `,
};