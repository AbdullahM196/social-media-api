import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import notificationController from "../Controllers/notificationController";
import AuthMiddleware from "../Middlewares/AuthMiddleware";

const router = Router();
router.post(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await notificationController.sendNotification(req, res);
  })
);
router.get(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await notificationController.getNotifications(req, res);
  })
);

export default router;
