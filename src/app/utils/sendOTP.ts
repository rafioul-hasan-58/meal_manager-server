import ApiError from "../errors/ApiError";
import prisma from "../lib/prisma";
import status from "http-status";
import { generateOTP } from "./generateOTP";
import { sendMail } from "./sendEmail";

export const sendOTP = async (email: string) => {
  // Step 1️⃣: Generate OTP and expiry time
  const otpCode = generateOTP().toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 10 min expiry

  // Step 2️⃣: Upsert OTP
  const otp = await prisma.oTP.create({
    data: {
      otpCode,
      otpExpiresAt
    }
  });
  // Step 4️⃣: Send OTP via email
  const res = await sendMail(email, otpCode);
  console.log("res", res)
  return {
    message: "OTP sent successfully",
    expiresAt: otp.otpExpiresAt,
  };
};
