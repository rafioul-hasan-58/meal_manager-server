import { Plan } from "@prisma/client";
import prisma from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createPlan = async (payload: Plan) => {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create Product in Stripe
    const product = await stripe.products.create({
      name: payload.planName,
      description: payload.description!,
      active: payload.active,
    });

    // Step 2: Create Price in Stripe
    const recurringData: any = {
      interval: payload.interval,
      interval_count: payload.intervalCount,
    };

    if (
      typeof payload.freeTrialDays === "number" &&
      Number.isInteger(payload.freeTrialDays) &&
      payload.freeTrialDays >= 0
    ) {
      recurringData.trial_period_days = payload.freeTrialDays;
    }

    const price = await stripe.prices.create({
      currency: payload.currency,
      unit_amount: Math.round(payload.amount * 100),
      active: payload.active,
      recurring: recurringData,
      product: product.id,
    });

    // Step 3: Create Plan Record in Database
    const dbPlan = await tx.plan.create({
      data: {
        amount: payload.amount || 0,
        planName: payload.planName,
        currency: payload.currency,
        interval: payload.interval,
        intervalCount: payload.intervalCount,
        freeTrialDays: payload.freeTrialDays,
        productId: product.id,
        priceId: price.id,
        active: payload.active,
        description: payload.description,
        features: payload.features,
      },
    });
    return dbPlan;
  });
  return result;
};

// Get All Plans
const getAllPlans = async () => {
  const plans = await prisma.plan.findMany();
  return plans;
};

// Get a Single Plan by ID
const getPlanById = async (planId: string) => {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  return plan;
};

const deletePlan = async (planId: string) => {
  console.log(deletePlan);
  return await prisma.$transaction(async (tx) => {
    // Step 1: Find the plan record in the database
    const plan = await tx.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    // Step 2: Deactivate the price in Stripe
    await stripe.prices.update(plan.priceId, { active: false });

    // Step 3: Deactivate the product in Stripe
    await stripe.products.update(plan.productId, { active: false });

    // Step 4: Delete the plan record in the database
    await tx.plan.delete({
      where: { id: planId },
    });

    return {
      message: `Plan with ID ${planId} archived and deleted successfully`,
    };
  });
};

export const PlanServices = {
  createPlan,
  getAllPlans,
  getPlanById,
  deletePlan,
};
