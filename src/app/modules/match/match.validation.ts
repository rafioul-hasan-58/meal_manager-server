import { z } from "zod";
import { MatchRole, MemberStatus } from "@prisma/client";

// ── addMember ─────────────────────────────────────────────────────────────────
const addMemberSchema = z.object({
    fullName: z
        .string()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name too long"),

    email: z
        .string()
        .email("Invalid email address"),
    matchRole: z.nativeEnum(MatchRole).default(MatchRole.MEMBER),
});

// ── addMultipleMembers ────────────────────────────────────────────────────────
const addMultipleMembersSchema = z.object({
    members: z
        .array(addMemberSchema)
        .min(1, { message: "At least one member is required" }),
});

// ── updateMemberRole ──────────────────────────────────────────────────────────
const updateMemberRoleSchema = z.object({
    matchRole: z.nativeEnum(MatchRole, { required_error: "Match role is required" }),
});
const removeMemberSchema = z.object({
    matchId: z.string({ required_error: "Match id is required" }),
});

// ── updateMemberStatus ────────────────────────────────────────────────────────
const updateMemberStatusSchema = z.object({
    status: z.nativeEnum(MemberStatus, { required_error: "Status is required" }),
});

// ── removeManyMembers ─────────────────────────────────────────────────────────
const removeManyMembersSchema = z.object({
    userIds: z
        .array(z.string({ required_error: "Each userId must be a string" }))
        .min(1, { message: "At least one userId is required" }),
});

export const MatchValidation = {
    addMemberSchema,
    removeMemberSchema,
    addMultipleMembersSchema,
    updateMemberRoleSchema,
    updateMemberStatusSchema,
    removeManyMembersSchema,
};