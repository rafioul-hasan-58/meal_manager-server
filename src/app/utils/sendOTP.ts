import ApiError from "../errors/ApiError";
import prisma from "../lib/prisma";
import status from "http-status";
import { generateOTP } from "./generateOTP";
import { sendMail } from "./sendEmail";

export const sendOTP = async (userId: string) => {
  // Step 1️⃣: Generate OTP and expiry time
  const otpCode = generateOTP().toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 10 min expiry

  // Step 2️⃣: Upsert OTP
  const otp = await prisma.oTP.upsert({
    where: { userId },
    update: {
      otpCode,
      otpExpiresAt,
      updatedAt: new Date(),
    },
    create: {
      otpCode,
      otpExpiresAt,
      userId,
    },
  });

  // Step 3️⃣: Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found while sending OTP!");
  }

  // Step 4️⃣: Send OTP via email
  const res = await sendMail(user.email, otpCode);
  console.log("res", res)
  return {
    message: "OTP sent successfully",
    expiresAt: otp.otpExpiresAt,
  };
};
