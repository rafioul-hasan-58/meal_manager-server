import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";

// ── helpers ───────────────────────────────────────────────────────────────────
const computeTotal = (breakfast: number, lunch: number, dinner: number) =>
    breakfast + lunch + dinner;

const normalizeDate = (date: string | Date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// ── addSingleMeal ─────────────────────────────────────────────────────────────
export const addSingleMeal = async (
    matchId: string,
    addedById: string,
    payload: {
        userId: string;
        date: string;
        breakfast?: number;
        lunch?: number;
        dinner?: number;
    }
) => {
    const { userId, date, breakfast = 0, lunch = 0, dinner = 0 } = payload;

    // Ensure the member belongs to this match
    const member = await prisma.matchMember.findFirst({ where: { matchId, userId } });
    if (!member) throw new ApiError(status.NOT_FOUND, "User is not a member of this match!");

    const normalizedDate = normalizeDate(date);
    const totalMeals = computeTotal(breakfast, lunch, dinner);

    const existing = await prisma.mealEntry.findUnique({
        where: { matchId_userId_date: { matchId, userId, date: normalizedDate } },
    });
    if (existing) throw new ApiError(status.CONFLICT, "Meal entry already exists for this date!");

    const meal = await prisma.mealEntry.create({
        data: { matchId, userId, addedById, date: normalizedDate, breakfast, lunch, dinner, totalMeals },
    });

    return meal;
};

// ── addMultipleMeals ──────────────────────────────────────────────────────────
export const addMultipleMeals = async (
    matchId: string,
    addedById: string,
    entries: {
        userId: string;
        date: string;
        breakfast?: number;
        lunch?: number;
        dinner?: number;
    }[]
) => {
    // Validate all members belong to this match
    const userIds = [...new Set(entries.map((e) => e.userId))];
    const members = await prisma.matchMember.findMany({ where: { matchId, userId: { in: userIds } } });
    const validUserIds = new Set(members.map((m) => m.userId));
    const invalidUsers = userIds.filter((id) => !validUserIds.has(id));
    if (invalidUsers.length > 0) {
        throw new ApiError(
            status.BAD_REQUEST,
            `These users are not members of this match: ${invalidUsers.join(", ")}`
        );
    }

    // Build data & detect conflicts
    const data = entries.map((e) => {
        const breakfast = e.breakfast ?? 0;
        const lunch = e.lunch ?? 0;
        const dinner = e.dinner ?? 0;
        return {
            matchId,
            addedById,
            userId: e.userId,
            date: normalizeDate(e.date),
            breakfast,
            lunch,
            dinner,
            totalMeals: computeTotal(breakfast, lunch, dinner),
        };
    });

    // createMany skips duplicates; use skipDuplicates for idempotency
    const result = await prisma.mealEntry.createMany({ data });

    return { created: result.count, total: entries.length };
};

// ── updateMeal ────────────────────────────────────────────────────────────────
export const updateMeal = async (
    id: string,
    matchId: string,
    payload: { breakfast?: number; lunch?: number; dinner?: number }
) => {
    const existing = await prisma.mealEntry.findUnique({ where: { id } });
    if (!existing) throw new ApiError(status.NOT_FOUND, "Meal entry not found!");
    if (existing.matchId !== matchId)
        throw new ApiError(status.FORBIDDEN, "This meal does not belong to your match!");

    const breakfast = payload.breakfast ?? existing.breakfast;
    const lunch = payload.lunch ?? existing.lunch;
    const dinner = payload.dinner ?? existing.dinner;
    const totalMeals = computeTotal(breakfast, lunch, dinner);

    const updated = await prisma.mealEntry.update({
        where: { id },
        data: { breakfast, lunch, dinner, totalMeals },
    });

    return updated;
};

// ── deleteMeal ────────────────────────────────────────────────────────────────
export const deleteMeal = async (id: string, matchId: string) => {
    const existing = await prisma.mealEntry.findUnique({ where: { id } });
    if (!existing) throw new ApiError(status.NOT_FOUND, "Meal entry not found!");
    if (existing.matchId !== matchId)
        throw new ApiError(status.FORBIDDEN, "This meal does not belong to your match!");

    await prisma.mealEntry.delete({ where: { id } });
    return null;
};

// ── deleteManyMeals ───────────────────────────────────────────────────────────
export const deleteManyMeals = async (ids: string[], matchId: string) => {
    // Verify all entries belong to this match
    const entries = await prisma.mealEntry.findMany({
        where: { id: { in: ids }, matchId },
        select: { id: true },
    });

    if (entries.length !== ids.length) {
        const foundIds = new Set(entries.map((e) => e.id));
        const notFound = ids.filter((id) => !foundIds.has(id));
        throw new ApiError(
            status.BAD_REQUEST,
            `Some meal entries were not found or don't belong to this match: ${notFound.join(", ")}`
        );
    }

    const result = await prisma.mealEntry.deleteMany({ where: { id: { in: ids }, matchId } });
    return { deleted: result.count };
};

// ── getAllMeals ───────────────────────────────────────────────────────────────
export const getAllMeals = async (
    matchId: string,
    query: {
        userId?: string;
        startDate?: string;
        endDate?: string;
        page: number;
        limit: number;
    }
) => {
    const { userId, startDate, endDate, page, limit } = query;

    const where: any = { matchId };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = normalizeDate(startDate);
        if (endDate) where.date.lte = normalizeDate(endDate);
    }

    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
        prisma.mealEntry.count({ where }),
        prisma.mealEntry.findMany({
            where,
            skip,
            take: limit,
            orderBy: { date: "desc" },
            include: {
                user: { select: { id: true, fullName: true, profileImage: true } },
                addedBy: { select: { id: true, fullName: true } },
            },
        }),
    ]);

    return {
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        data,
    };
};

// ── getSingleMeal ─────────────────────────────────────────────────────────────
export const getSingleMeal = async (id: string, matchId: string) => {
    const meal = await prisma.mealEntry.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, fullName: true, profileImage: true } },
            addedBy: { select: { id: true, fullName: true } },
        },
    });

    if (!meal) throw new ApiError(status.NOT_FOUND, "Meal entry not found!");
    if (meal.matchId !== matchId)
        throw new ApiError(status.FORBIDDEN, "This meal does not belong to your match!");

    return meal;
};

export const MealService = {
    addSingleMeal,
    addMultipleMeals,
    updateMeal,
    deleteMeal,
    deleteManyMeals,
    getAllMeals,
    getSingleMeal,
};