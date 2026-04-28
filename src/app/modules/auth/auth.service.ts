import status from "http-status";
import ApiError from "../../errors/ApiError";
import { hashPassword } from "../user/user.utils";
import { createLoginToken, createToken } from "./auth.utils";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { comparePassword } from "../../utils/comparePassword";
import { sendOTP } from "../../utils/sendOTP";


export const AuthService = {
  verifyOTP: async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } })

    if (!savedOtp) {
      throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
    }

    if (savedOtp.otpExpiresAt! < new Date()) {
      throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
    }

    if (Number(savedOtp.otpCode) !== Number(otp)) {
      throw new ApiError(status.BAD_REQUEST, "OTP not matched!");
    }

    // update database
    await prisma.oTP.delete({
      where: { id: savedOtp.id },
    });

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
    return {
      userData: jwtPayload,
      accessToken
    }
  },

  verifyOTPLogin: async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } })

    if (!savedOtp) {
      throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
    }

    if (savedOtp.otpExpiresAt! < new Date()) {
      throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
    }

    if (Number(savedOtp.otpCode) !== Number(otp)) {
      throw new ApiError(status.BAD_REQUEST, "OTP not matched!");
    }

    // update database
    await prisma.oTP.delete({
      where: { id: savedOtp.id },
    });

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
    return {
      accessToken
    }
  },

  // verifyWithFace: async (userId: string, file: Express.Multer.File) => {
  //   // Get user with face token
  //   const user = await prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       id: true,
  //       fullName: true,
  //       email: true,
  //       profileImage: true,
  //       role: true,
  //       faceToken: true,
  //     }
  //   });

  //   if (!user?.faceToken) {
  //     throw new ApiError(status.BAD_REQUEST, "Face not registered. Please register your face first.");
  //   }

  //   // Prepare FormData
  //   const formData = new FormData();
  //   formData.append('registered_face_token', user.faceToken);
  //   formData.append('login_selfie', file.buffer, {
  //     filename: file.originalname,
  //     contentType: file.mimetype,
  //   });

  //   try {
  //     // Single API call - no retry, no compression
  //     const response = await axios.post(
  //       'http://206.162.244.175:5031/api/face/verify',
  //       formData,
  //       {
  //         headers: {
  //           ...formData.getHeaders(),
  //           'accept': 'application/json',
  //         },
  //         timeout: 15000, // 15 seconds
  //       }
  //     );
  //     // Check if face matched
  //     if (response.data.is_match) {
  //       const userData = {
  //         id: user.id,
  //         fullName: user.fullName ?? undefined,
  //         email: user.email,
  //         profileImage: user.profileImage,
  //         role: user.role,
  //       };

  //       const accessToken = createToken(
  //         userData,
  //         config.jwt.access_secret as string,
  //         config.jwt.access_expires_in as string
  //       );

  //       return { userData, accessToken };
  //     }

  //     // Face did not match
  //     throw new ApiError(
  //       status.UNAUTHORIZED,
  //       "Face verification failed. Please try again."
  //     );

  //   } catch (error: any) {
  //     // Handle our custom errors
  //     if (error instanceof ApiError) {
  //       throw error;
  //     }
  //     console.log(error.response)
  //     // Handle API errors
  //     if (error.response) {
  //       const statusCode = error.response.status;
  //       const message = error.response.data?.message || error.response.data?.detail;

  //       if (statusCode === 500 || statusCode === 503) {
  //         throw new ApiError(
  //           status.SERVICE_UNAVAILABLE,
  //           "Face verification service is temporarily unavailable. Please try again later."
  //         );
  //       }

  //       throw new ApiError(
  //         status.BAD_REQUEST,
  //         message || "Face verification failed"
  //       );
  //     }
  //     // Network or timeout errors
  //     throw new ApiError(
  //       status.SERVICE_UNAVAILABLE,
  //       "Unable to connect to face verification service. Please check your connection."
  //     );
  //   }
  // },

  verifyWithFace: async (userId: string) => {

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role
    };

    const accessToken = createLoginToken(
      userData,
      config.jwt.access_secret as string,
      config.jwt.access_expires_in as string
    );

    return {
      userData,
      accessToken
    }
  },
  verifyWithMail: async (userId: string) => {
    const res = await sendOTP(userId);
    return {
      message: res.message
    }
  },

  loginUser: async (email: string, password: string) => {

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const jwtPayload = {
      id: user.id
    };

    const accessToken = createLoginToken(
      jwtPayload,
      config.jwt.access_secret as string,
      config.jwt.access_expires_in as string
    );

    if (!user.faceVerified) {
      return {
        statusCode: status.PERMANENT_REDIRECT,
        success: true,
        message: "Please verify your face before login!",
        redirectTo: "face-verification",
        accessToken,
      };
    }
    const isPasswordMatched = await comparePassword(password, user.password ?? "");

    if (!isPasswordMatched) {
      throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");
    }

    return {
      accessToken
    }
  },

  socialLogin: async (payload: {
    email: string;
    fullName: string;
    profileImage?: string;
  }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.trim(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        faceVerified: true,
        role: true
      },
    });

    if (user) {
      const userData = {
        id: user.id
      };

      const accessToken = createLoginToken(
        userData,
        config.jwt.access_secret as string,
        config.jwt.access_expires_in as string
      );
      if (!user.faceVerified) {
        return {
          statusCode: status.PERMANENT_REDIRECT,
          success: true,
          message: "Please verify your face before login!",
          redirectTo: "face-verification",
          accessToken,
        };
      }
      return {
        userData,
        accessToken
      }
    } else {
      const user = await prisma.user.create({
        data: {
          ...payload,
          password: ""
        }
      })

      const userData = {
        id: user.id
      };

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
    }
  },

  changePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await prisma.user.findUnique({
      where: { email }, // requires @unique on email
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const isPasswordMatch = await comparePassword(currentPassword, user.password ?? "");
    if (!isPasswordMatch) {
      throw new ApiError(status.UNAUTHORIZED, "Current password is incorrect!");
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email }, // or { id: user.id } if email isn’t unique
      data: { password: hashedNewPassword },
    });

    return null;
  },


  forgotPassword: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    if (!user.faceVerified) {
      throw new ApiError(status.UNAUTHORIZED, "Your face is not verified!");
    }

    // Step 1: Generate OTP
    const res = await sendOTP(user.id);
    return {
      message: res.message
    }
  },

  resetPassword: async (
    email: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      throw new ApiError(status.BAD_REQUEST, "Passwords do not match!");
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }


    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Password reset successfully!",
    };
  },

  resendOtp: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    await sendOTP(user.id)
    return {
      message: "New OTP has been sent to your email for reset password.",
    };
  }

};
