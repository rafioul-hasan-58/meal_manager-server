import Stripe from "stripe";
import status from "http-status";
import { PaymentStatus } from "@prisma/client";
import ApiError from "../errors/ApiError";
import prisma from "../lib/prisma";

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  // Find the subscription payment in database
  const subscription = await prisma.subscription.findFirst({
    where: {
      stripePaymentId: paymentIntent.id,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  if (!subscription) {
    throw new ApiError(
      status.NOT_FOUND,
      `Subscription payment not found for ID: ${paymentIntent.id}`
    );
  }

  if (paymentIntent.status !== "succeeded") {
    throw new ApiError(
      status.BAD_REQUEST,
      "Payment intent is not in succeeded state"
    );
  }

  await prisma.subscription.update({
    where: {
      stripePaymentId: paymentIntent.id,
    },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  // await prisma.user.update({
  //   where: {
  //     stripePaymentId: paymentIntent.id,
  //   },
  //   data: {
  //     isSubscribed: true,
  //     updatedAt: new Date(),
  //   },
  // });
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      stripePaymentId: paymentIntent.id,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  if (!subscription) {
    throw new ApiError(
      status.NOT_FOUND,
      `Subscription payment not found for ID: ${paymentIntent.id}`
    );
  }

  // Update vehicle payment status to failed
  await prisma.subscription.update({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      paymentStatus: PaymentStatus.CANCELED,
    },
  });
};

8
export { handlePaymentIntentSucceeded, handlePaymentIntentFailed };
