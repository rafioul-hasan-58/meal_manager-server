import { mailService } from "../infrastructure/mail/mail.service";
import prisma from "../lib/prisma";
import { generateOTP } from "./generateOTP";

export const sendOTP = async (email: string) => {
  // Step 1️⃣: Generate OTP and expiry time
  const otpCode = generateOTP().toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 10 min expiry

  // Step 2️⃣: Upsert OTP
  const otp = await prisma.oTP.upsert({
    where: { email },
    update: {
      otpCode,
      otpExpiresAt,
    },
    create: {
      email,
      otpCode,
      otpExpiresAt,
    },
  });

  // Step 4️⃣: Send OTP via email
  const res = await mailService.sendEmail(email, otpCode,"OTP Verification Code");
  console.log("res", res)
  return {
    message: "OTP sent successfully",
    expiresAt: otp.otpExpiresAt,
  };
};
