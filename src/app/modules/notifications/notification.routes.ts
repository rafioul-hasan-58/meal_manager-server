import  { Router } from 'express';
import { notificationController } from './notification.controller';
import auth from '../../middlewares/auth';


const router = Router();



router.get('/my-notifications', auth(), notificationController.getNotifications);

router.get(
  '/:notificationId',
  auth(),
  notificationController.getSingleNotificationById,
);

router.put(
  "/read-all",
  auth(),
  notificationController.isReadNotificationController
);
router.post(
  "/toggleAppNotification",
  auth(),
  notificationController.toggleAppNotification
);

export const NotificationsRouters = router;
