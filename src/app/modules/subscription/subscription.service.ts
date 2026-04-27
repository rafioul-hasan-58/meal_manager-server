import Stripe from "stripe";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { Subscription } from "@prisma/client";
import QueryBuilder from "../../builder/QueryBuilder";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { handlePaymentIntentFailed, handlePaymentIntentSucceeded } from "../../utils/webhook";
const stripe = new Stripe(config.stripe.secretKey as string);
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const createSubscription = async (email: string, planId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find user
    const user = await tx.user.findUnique({
      where: { email },
    });
    if (user?.isSubscribed) {
      throw new ApiError(status.BAD_REQUEST, "User already subscribed");
    }

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }
    // 2. Find plan
    const plan = await tx.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new ApiError(status.NOT_FOUND, "Plan not found");
    }

    // 3. Calculate endDate from interval & intervalCount
    const startDate = new Date();
    const count = plan.intervalCount || 1;

    let endDate: Date;
    switch (plan.interval) {
      case "month":
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + count);
        if (endDate.getDate() !== startDate.getDate()) endDate.setDate(0);
        break;
      case "year":
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + count);
        break;
      default:
        throw new ApiError(status.BAD_REQUEST, "Invalid interval");
    }
    // 4. Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.amount * 100),
      currency: "usd",
      metadata: {
        userId: user.id,
        planId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    // 5. Handle existing subscription
    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: user.id },
    });

    let subscription;
    if (existingSubscription?.paymentStatus === "PENDING") {
      subscription = await tx.subscription.update({
        where: { userId: user.id },
        data: {
          planId,
          stripePaymentId: paymentIntent.id,
          startDate,
          amount: plan.amount,
          endDate: existingSubscription.endDate || endDate,
          paymentStatus: "PENDING",
        },
      });
    } else {
      // 6. Create new subscription with calculated endDate
      subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId,
          startDate,
          amount: plan.amount,
          stripePaymentId: paymentIntent.id,
          paymentStatus: "PENDING",
          endDate, // Now includes the calculated endDate
        },
      });
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        planExpirationDate: endDate,
        stripePaymentId: paymentIntent.id,
      },
    });

    return {
      subscription,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  });
};

const getAllSubscription = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.subscription, query);
  const subscription = await queryBuilder
    .search([""])
    .paginate()
    .fields()
    .include({
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePic: true,
          role: true,
          isSubscribed: true,
          planExpiration: true,
        },
      },
      plan: true,
    })
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: subscription };
};

const getSingleSubscription = async (subscriptionId: string) => {
  const result = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          email: true,
          role: true,
          isSubscribed: true,
          planExpirationDate: true,
        },
      },
      plan: true,
    },
  });

  if (!result) {
    throw new ApiError(status.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const getMySubscription = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const result = await prisma.subscription.findFirst({
    where: { user: { email } },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          email: true,
          role: true,
          isSubscribed: true,
          planExpirationDate: true,
        },
      },
      plan: true,
    },
  });

  if (!result) {
    throw new ApiError(status.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const updateSubscription = async (
  subscriptionId: string,
  data: Subscription
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new ApiError(status.NOT_FOUND, "Subscription not found");
  }

  const result = await prisma.subscription.update({
    where: { id: subscriptionId },
    data,
  });
  return result;
};

const deleteSubscription = async (subscriptionId: string) => {
  return await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(status.NOT_FOUND, "Subscription not found");
    }

    await tx.subscription.delete({
      where: { id: subscriptionId },
    });

    await tx.user.updateMany({
      where: { stripePaymentId: subscription.stripePaymentId },
      data: {
        isSubscribed: false,
        stripePaymentId: null,
        planExpirationDate: null,
      },
    });
    return null;
  });
};

const HandleStripeWebhook = async (rawBody: any, sig: any) => {
  console.log("Webhook received:", rawBody);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      config.stripe.webhookSecret as string
    );
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    throw new ApiError(status.BAD_REQUEST, "Invalid Stripe signature");
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { received: true };
};
const monthlyRevenue = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Fetch all subscriptions for the current year with completed payment
  const subscriptions = await prisma.subscription.findMany({
    where: {
      paymentStatus: "COMPLETED",
      startDate: {
        gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
      },
    },
    select: {
      amount: true,
      startDate: true,
    },
  });

  // 2. Initialize monthly revenue map
  const monthlyRevenueMap: Record<string, number> = {};
  MONTHS.forEach((month) => (monthlyRevenueMap[month] = 0));

  // 3. Aggregate revenue per month
  subscriptions.forEach((sub) => {
    const monthIndex = sub.startDate.getMonth();
    const monthName = MONTHS[monthIndex];
    monthlyRevenueMap[monthName] += sub.amount;
  });

  // 4. Prepare chartData array
  const chartData = MONTHS.map((month) => ({
    month,
    revenue: parseFloat(monthlyRevenueMap[month].toFixed(2)),
  }));

  // 5. Find highlighted month (latest month with revenue)
  const nonZeroMonths = chartData.filter((d) => d.revenue > 0);
  let highlightedMonth = null;
  if (nonZeroMonths.length) {
    const lastMonth = nonZeroMonths[nonZeroMonths.length - 1];
    const prevMonthRevenue =
      nonZeroMonths.length > 1
        ? nonZeroMonths[nonZeroMonths.length - 2].revenue
        : 0;
    const percentageChange = prevMonthRevenue
      ? ((lastMonth.revenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;

    highlightedMonth = {
      month: lastMonth.month,
      revenue: lastMonth.revenue,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    };
  }

  return {
    chartData,
    highlightedMonth,
  };
};

const getSubscribedUser = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(prisma.user, query);

  const subscription = await queryBuilder
    .filter() // applies query-based filters
    .rawFilter({ isSubscribed: true }) // enforce only subscribed users
    .search(["fullName", "email"]) // searchable fields
    .paginate()
    .fields()
    .execute();

  const meta = await queryBuilder.countTotal();

  // Remove password before returning
  const data = subscription.map((user: any) => {
    const { password, ...rest } = user;
    return rest;
  });

  return { meta, data };
};

export const SubscriptionServices = {
  getMySubscription,
  createSubscription,
  getAllSubscription,
  updateSubscription,
  deleteSubscription,
  getSingleSubscription,
  HandleStripeWebhook,
  getSubscribedUser,
  monthlyRevenue,
};
