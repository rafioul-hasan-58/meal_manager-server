import status from "http-status";
import { MatchRole, MemberStatus } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { hashPassword } from "../user/user.utils";

// ── addMember ─────────────────────────────────────────────────────────────────
export const addMember = async (
    matchId: string,
    payload: { fullName: string, email: string, matchRole?: MatchRole }
) => {


    const { email } = payload;

    // check if user already exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        const isMatchMember = await prisma.matchMember.findUnique({
            where: {
                matchId_userId: {
                    matchId,
                    userId: user.id
                },
            }
        });
        if (isMatchMember?.status === MemberStatus.ACTIVE) {
            throw new ApiError(status.CONFLICT, "User is already a member of this match!");
        }
        else if (isMatchMember?.status === MemberStatus.REMOVED) {
            const updated = await prisma.matchMember.update({
                where: { id: isMatchMember.id },
                data: { status: MemberStatus.ACTIVE, removedAt: null },
            });
            return updated;
        }

        // if another match member
        const isAnotherMatchMember = await prisma.matchMember.findFirst({
            where: {
                userId: user.id,
                matchId: { not: matchId }
            }
        });
        if (isAnotherMatchMember && isAnotherMatchMember.status === MemberStatus.ACTIVE) {
            throw new ApiError(status.CONFLICT, "User already exists in another match!");
        }
        else if (isAnotherMatchMember && isAnotherMatchMember.status === MemberStatus.REMOVED) {

            const res = await prisma.$transaction(async (tx) => {
                {
                    // remove from existing match
                    await tx.matchMember.delete({ where: { id: isAnotherMatchMember.id } });
                    // ad
                    const createMember = await tx.matchMember.create({
                        data: {
                            matchId,
                            userId: user.id,
                            matchRole: MatchRole.MEMBER
                        },
                    });
                    return createMember;
                }
            });

            return res

        }
    };



    // Ensure match exists
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new ApiError(status.NOT_FOUND, "Match not found!");


    const hashedPassword = await hashPassword("12345678");

    await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                fullName: payload.fullName,
                email: payload.email,
                password: hashedPassword,
            },
        });

        await tx.matchMember.create({
            data: {
                matchId: match.id,
                userId: user.id,
                matchRole: MatchRole.MEMBER
            },
        });
    });
    return { message: "Match member added successfully!" };

};

// ── addMultipleMembers ────────────────────────────────────────────────────────
export const addMultipleMembers = async (
    matchId: string,
    members: { userId: string; matchRole?: MatchRole }[]
) => {
    // Ensure match exists
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new ApiError(status.NOT_FOUND, "Match not found!");

    // Validate all users exist
    const userIds = [...new Set(members.map((m) => m.userId))];
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
    });
    const validUserIds = new Set(users.map((u) => u.id));
    const invalidUsers = userIds.filter((id) => !validUserIds.has(id));
    if (invalidUsers.length > 0) {
        throw new ApiError(
            status.BAD_REQUEST,
            `These users do not exist: ${invalidUsers.join(", ")}`
        );
    }

    // Find already active members
    const alreadyActive = await prisma.matchMember.findMany({
        where: { matchId, userId: { in: userIds }, status: MemberStatus.ACTIVE },
        select: { userId: true },
    });
    const activeSet = new Set(alreadyActive.map((m) => m.userId));
    const toAdd = members.filter((m) => !activeSet.has(m.userId));

    if (toAdd.length === 0) {
        throw new ApiError(status.CONFLICT, "All provided users are already active members!");
    }

    const data = toAdd.map((m) => ({
        matchId,
        userId: m.userId,
        matchRole: m.matchRole ?? MatchRole.MEMBER,
    }));

    const result = await prisma.matchMember.createMany({ data });

    return {
        created: result.count,
        total: members.length,
        skipped: members.length - result.count,
    };
};

// ── removeMember ──────────────────────────────────────────────────────────────
export const removeMember = async (matchId: string, userId: string) => {
    const member = await prisma.matchMember.findFirst({
        where: { matchId, userId, status: MemberStatus.ACTIVE },
    });
    if (!member) throw new ApiError(status.NOT_FOUND, "Active member not found in this match!");

    // Prevent removing the match admin
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match?.adminId === userId) {
        throw new ApiError(status.FORBIDDEN, "Cannot remove the match admin!");
    }

    const updated = await prisma.matchMember.update({
        where: { id: member.id },
        data: { status: MemberStatus.REMOVED, removedAt: new Date() },
        include: {
            user: { select: { id: true, fullName: true, profileImage: true, email: true } },
        },
    });

    return updated;
};

// ── removeManyMembers ─────────────────────────────────────────────────────────
export const removeManyMembers = async (matchId: string, userIds: string[]) => {
    // Prevent removing admin
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new ApiError(status.NOT_FOUND, "Match not found!");
    if (userIds.includes(match.adminId)) {
        throw new ApiError(status.FORBIDDEN, "Cannot remove the match admin!");
    }

    const activeMembers = await prisma.matchMember.findMany({
        where: { matchId, userId: { in: userIds }, status: MemberStatus.ACTIVE },
        select: { id: true, userId: true },
    });

    if (activeMembers.length === 0) {
        throw new ApiError(status.NOT_FOUND, "No active members found for the provided user IDs!");
    }

    const activeIds = activeMembers.map((m) => m.id);

    await prisma.matchMember.updateMany({
        where: { id: { in: activeIds } },
        data: { status: MemberStatus.REMOVED, removedAt: new Date() },
    });

    return { removed: activeIds.length, total: userIds.length };
};

// ── updateMemberRole ──────────────────────────────────────────────────────────
export const updateMemberRole = async (
    matchId: string,
    userId: string,
    matchRole: MatchRole
) => {
    const member = await prisma.matchMember.findFirst({
        where: { matchId, userId, status: MemberStatus.ACTIVE },
    });
    if (!member) throw new ApiError(status.NOT_FOUND, "Active member not found in this match!");

    const updated = await prisma.matchMember.update({
        where: { id: member.id },
        data: { matchRole },
        include: {
            user: { select: { id: true, fullName: true, profileImage: true, email: true } },
        },
    });

    return updated;
};

// ── updateMemberStatus ────────────────────────────────────────────────────────
export const updateMemberStatus = async (
    matchId: string,
    userId: string,
    memberStatus: MemberStatus
) => {
    const member = await prisma.matchMember.findFirst({ where: { matchId, userId } });
    if (!member) throw new ApiError(status.NOT_FOUND, "Member not found in this match!");

    const updated = await prisma.matchMember.update({
        where: { id: member.id },
        data: {
            status: memberStatus,
            removedAt: memberStatus === MemberStatus.REMOVED ? new Date() : null,
        },
        include: {
            user: { select: { id: true, fullName: true, profileImage: true, email: true } },
        },
    });

    return updated;
};

// ── getAllMembers ──────────────────────────────────────────────────────────────
export const getAllMembers = async (
    matchId: string,
    query: { status?: MemberStatus; matchRole?: MatchRole; page: number; limit: number }
) => {
    const { status: memberStatus, matchRole, page, limit } = query;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new ApiError(status.NOT_FOUND, "Match not found!");

    const where: any = { matchId };
    if (memberStatus) where.status = memberStatus;
    if (matchRole) where.matchRole = matchRole;

    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
        prisma.matchMember.count({ where }),
        prisma.matchMember.findMany({
            where,
            skip,
            take: limit,
            orderBy: { joinedAt: "asc" },
            include: {
                user: { select: { id: true, fullName: true, profileImage: true, email: true } },
            },
        }),
    ]);

    return {
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        data,
    };
};

// ── getSingleMember ───────────────────────────────────────────────────────────
export const getSingleMember = async (matchId: string, userId: string) => {
    const member = await prisma.matchMember.findFirst({
        where: { matchId, userId },
        include: {
            user: { select: { id: true, fullName: true, profileImage: true, email: true } },
        },
    });
    if (!member) throw new ApiError(status.NOT_FOUND, "Member not found in this match!");

    return member;
};

export const MatchService = {
    addMember,
    addMultipleMembers,
    removeMember,
    removeManyMembers,
    updateMemberRole,
    updateMemberStatus,
    getAllMembers,
    getSingleMember,
};