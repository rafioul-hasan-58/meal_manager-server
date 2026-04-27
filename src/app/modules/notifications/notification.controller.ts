import { Request, Response } from "express";
import { notificationServices,  } from "./notification.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";


const getNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await notificationServices.getNotificationsFromDB(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});


const getSingleNotificationById = catchAsync(
  async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;
    const notification = await notificationServices.isReadNotificationFromDB(
      notificationId
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notification retrieved successfully",
      data: notification,
    });
  }
);
const isReadNotificationController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.user;
    const notification = await notificationServices.isReadNotificationFromDB(
      id
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notification retrieved successfully",
      data: notification,
    });
  }
);
const toggleAppNotification = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.user;
    const notification = await notificationServices.toggleAppNotification(
      id
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "App Notification status changed successfully",
      data: notification,
    });
  }
);


export const notificationController = {
  toggleAppNotification,
  getNotifications,
  getSingleNotificationById,
  isReadNotificationController
}
