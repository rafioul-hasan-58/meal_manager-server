import status from "http-status";
import ApiError from "../../errors/ApiError";
import { hashPassword } from "../user/user.utils";
import { createLoginToken, createToken } from "./auth.utils";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { comparePassword } from "../../utils/comparePassword";
import { sendOTP } from "../../utils/sendOTP";

// ── verifyOTP ────────────────────────────────────────────────────────────────
export const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } });
  if (!savedOtp) throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
  if (savedOtp.otpExpiresAt! < new Date()) throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
  if (Number(savedOtp.otpCode) !== Number(otp)) throw new ApiError(status.BAD_REQUEST, "OTP not matched!");

  await prisma.oTP.delete({ where: { id: savedOtp.id } });

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName ?? undefined,
    email: user.email,
    appNotificationActive: user.appNotificationActive,
    profileImage: user.profileImage,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  return { userData: jwtPayload, accessToken };
};

// ── verifyOTPLogin ───────────────────────────────────────────────────────────
export const verifyOTPLogin = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } });
  if (!savedOtp) throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
  if (savedOtp.otpExpiresAt! < new Date()) throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
  if (Number(savedOtp.otpCode) !== Number(otp)) throw new ApiError(status.BAD_REQUEST, "OTP not matched!");

  await prisma.oTP.delete({ where: { id: savedOtp.id } });

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName ?? undefined,
    email: user.email,
    profileImage: user.profileImage,
    appNotificationActive: user.appNotificationActive,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  return { accessToken };
};


// ── verifyWithMail ───────────────────────────────────────────────────────────
export const verifyWithMail = async (email: string) => {
  const res = await sendOTP(email);
  return { message: res.message };
};

// ── loginUser ────────────────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const jwtPayload = { id: user.id };

  const accessToken = createLoginToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  const isPasswordMatched = await comparePassword(password, user.password ?? "");
  if (!isPasswordMatched) throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");

  return { accessToken };
};

// ── socialLogin ──────────────────────────────────────────────────────────────
export const socialLogin = async (payload: {
  email: string;
  fullName: string;
  profileImage?: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.trim() },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      faceVerified: true,
      role: true,
    },
  });



  const newUser = await prisma.user.create({
    data: { ...payload, password: "" },
  });

  const userData = { id: newUser.id };

  const accessToken = createLoginToken(
    userData,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  return {
    statusCode: status.PERMANENT_REDIRECT,
    success: true,
    message: "Please verify your face before login!",
    redirectTo: "face-verification",
    accessToken,
  };
};

// ── changePassword ───────────────────────────────────────────────────────────
export const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const isPasswordMatch = await comparePassword(currentPassword, user.password ?? "");
  if (!isPasswordMatch) throw new ApiError(status.UNAUTHORIZED, "Current password is incorrect!");

  const hashedNewPassword = await hashPassword(newPassword);
  await prisma.user.update({ where: { email }, data: { password: hashedNewPassword } });

  return null;
};

// ── forgotPassword ───────────────────────────────────────────────────────────
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const res = await sendOTP(user.id);
  return { message: res.message };
};

// ── resetPassword ────────────────────────────────────────────────────────────
export const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) throw new ApiError(status.BAD_REQUEST, "Passwords do not match!");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

  return { message: "Password reset successfully!" };
};

// ── resendOtp ────────────────────────────────────────────────────────────────
export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");

  await sendOTP(user.id);
  return { message: "New OTP has been sent to your email for reset password." };
};

export const AuthService = {
  verifyOTP,
  verifyOTPLogin,
  verifyWithMail,
  loginUser,
  socialLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
};