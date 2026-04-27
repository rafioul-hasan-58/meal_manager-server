import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import status from "http-status"
import admin from "../../utils/firebaseAdmin";

// Send notification to a single user
export const sendSingleNotification = async (
  receiverId: string,
  payload: {
    title: string,
    body: string,
    documentId?: string,
  }
) => {
  const user = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (payload.documentId) {
    const document = await prisma.document.findUnique({
      where: {
        id: payload.documentId
      }
    });
    if (!document) {
      throw new ApiError(status.NOT_FOUND, "Document not found!")
    }
  }

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User Not Found!");
  };

  if (!user.appNotificationActive) {
    return
  }

  await prisma.notification.create({
    data: {
      receiverId,
      title: payload.title,
      body: payload.body,
      documentId: payload.documentId
    },
  });

  // if (!user?.fcmToken) {
  //   throw new ApiError(404, "User not found with FCM token");
  // }

  // const message = {
  //   notification: {
  //     title: payload.title,
  //     body: payload.body,
  //   },
  //   token: user.fcmToken,
  // };
  // try {
  //   const response = await admin.messaging().send(message);
  //   return response;
  // } catch (error: any) {
  //   if (error.code === "messaging/invalid-registration-token") {
  //     throw new ApiError(400, "Invalid FCM registration token");
  //   } else if (error.code === "messaging/registration-token-not-registered") {
  //     throw new ApiError(404, "FCM token is no longer registered");
  //   } else {
  //     throw new ApiError(500, "Failed to send notification");
  //   }
  // }
};

const getNotificationsFromDB = async (userId: string) => {

  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: userId,
    },
    orderBy: { createdAt: "desc" },
  });

  if (notifications.length === 0) {
    throw new ApiError(404, "No notifications found for the user");
  }

  return notifications;
};

const isReadNotificationFromDB = async (id: string) => {
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: id,
      isRead: false,
    },
  });


  await prisma.notification.updateMany({
    where: { receiverId: id },
    data: { isRead: true },
  });

  return notifications;
};


export const toggleAppNotification = async (userId: string) => {

  // Find the current status of the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { appNotificationActive: true },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  // Toggle the current value
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      appNotificationActive: !user.appNotificationActive,
    },
    select: {
      id: true,
      appNotificationActive: true,

    },
  });

  return {
    message: `App notification is now ${updatedUser.appNotificationActive ? "enabled" : "disabled"}.`,
  };
};


export const notificationServices = {
  toggleAppNotification,
  sendSingleNotification,
  getNotificationsFromDB,
  isReadNotificationFromDB,
};
