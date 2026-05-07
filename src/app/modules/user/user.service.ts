import status from "http-status";
import { hashPassword } from "./user.utils";
import ApiError from "../../errors/ApiError";
import { User } from "@prisma/client";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { createToken } from "../auth/auth.utils";
import config from "../../../config";
import { RegisterInput } from "./user.validation";

// ── register ────────────────────────────────────────────────────────────────
const register = async (payload: RegisterInput) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new ApiError(status.BAD_REQUEST, "This email is already in use!");
  }

  const hashedPassword = await hashPassword(payload.password ?? "");
  let jwtPayload;
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
      },
    });

    const mess = await tx.mess.create({
      data: {
        adminId: user.id,
        name: payload.messName,
        address: payload.messAddress,
        description: payload.messDescription,
        approxTotalMembers: payload.approxTotalMembers,
      },
    });

    jwtPayload = {
      userId: user.id,
      messId: mess.id,
      email: user.email,
      profileImage: user.profileImage,
      globalRole: user.role
    }

    return { user };
  });

  const accessToken = createToken(
    jwtPayload!,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );
  return {
    accessToken
  };
};

// ── getAllUserFromDB ────────────────────────────────────────────────────────
const getAllUserFromDB = async (query: Record<string, unknown>) => {
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

  const data = result.map((user: User) => {
    const { password, ...rest } = user;
    return rest;
  });

  return { meta, data };
};

// ── updateProfile ───────────────────────────────────────────────────────────
const updateProfile = async (userId: string, payload: Partial<User>) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) throw new ApiError(status.NOT_FOUND, "User not found!");

  if (!payload.profileImage) {
    payload.profileImage = isUserExist.profileImage;
  }

  return prisma.user.update({
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
};



// ── getSingleUserByIdFromDB ─────────────────────────────────────────────────
const getSingleUserByIdFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");
  const { password, ...rest } = user;
  return rest;
};

// ── myProfile ───────────────────────────────────────────────────────────────
const myProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found!");
  const { password, ...rest } = user;
  return rest;
};

// ── deleteUserFromDB ────────────────────────────────────────────────────────
const deleteUserFromDB = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) throw new ApiError(status.NOT_FOUND, "User not found!");
  await prisma.user.delete({ where: { id: userId } });
  return null;
};

// ── Export Service ──────────────────────────────────────────────────────────
export const UserService = {
  register,
  getAllUserFromDB,
  updateProfile,
  getSingleUserByIdFromDB,
  myProfile,
  deleteUserFromDB,
};
