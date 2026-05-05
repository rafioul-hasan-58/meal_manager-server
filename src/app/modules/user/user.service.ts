import status from "http-status";
import { hashPassword } from "./user.utils";
import ApiError from "../../errors/ApiError";
import { User } from "@prisma/client";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { createLoginToken, createToken } from "../auth/auth.utils";
import config from "../../../config";
import { RegisterInput } from "./user.validation";


export const UserService = {
  register: async (payload: RegisterInput) => {
    const isUserExist = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (isUserExist) {
      throw new ApiError(status.BAD_REQUEST, "This email is already in use!");
    }

    const hashedPassword = await hashPassword(payload.password ?? "");

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create(
        {
          data: {
            fullName: payload.fullName,
            email: payload.email,
            password: hashedPassword,
            phone:payload.phone

          }
        }
      );
      const mess = await tx.mess.create(
        {
          data: { 
            adminId:user.id,
            name:payload.messName,
            address:payload.messAddress,
            description:payload.messDescription,
            approxTotalMembers:payload.approxTotalMembers
           }
        });
      return { user, mess };
    });
    return {
      message: "Your account has been created.Please verify!"
    }
  },
  getAllUserFromDB: async (query: Record<string, unknown>) => {
    const userQuery = new QueryBuilder(prisma.user, query)
      .search(["fullName", "email"])
      .filter()
      .paginate();

    const [result, meta] = await Promise.all([
      userQuery.execute(),
      userQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No users found!");
    }

    // Remove password from each user
    const data = result.map((user: User) => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      meta,
      data,
    };
  },
  updateProfile: async (userId: string, payload: Partial<User>) => {
    console.log(payload.fullName,)
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (!payload.profileImage) {
      payload.profileImage = isUserExist.profileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: payload.fullName,
        profileImage: payload.profileImage || "",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },
  updateFaceToken: async (userId: string, faceToken: string) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        faceToken,
        faceVerified: true
      },
    });

    const userData = {
      id: user.id,
      fullName: user.fullName ?? undefined,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    const accessToken = createToken(
      userData,
      config.jwt.access_secret as string,
      config.jwt.access_expires_in as string
    );

    return {
      userData,
      accessToken
    }

  },
  getSingleUserByIdFromDB: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const { password, ...rest } = user;

    return rest;
  },
  myProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const { password, ...rest } = user;

    return rest;
  },
  deleteUserFromDB: async (userId: string) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return null;
  }
};
