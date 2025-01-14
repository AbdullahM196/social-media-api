import asyncHandler from "express-async-handler";
import { Router, Response, Request } from "express";
import FriendRequestControllers from "../Controllers/FriendRequestControllers";
import AuthMiddleware from "../Middlewares/AuthMiddleware";

const router = Router();
router.post(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.sendFriendRequest(req, res);
  })
);
router.get(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.getFriendRequests(req, res);
  })
);
router.post(
  "/manage",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.manageFriendRequests(req, res);
  })
);
router.get(
  "/friendRequestsSentByUser",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.getFriendRequestsSentByUser(req, res);
  })
);
router.delete(
  "/cancelFriendsRequestSentByUser/:id",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.cancelFriendsRequestSentByUser(req, res);
  })
);
router.get(
  "/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.findUserFriends(req, res);
  })
);
router.patch(
  "/:userId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await FriendRequestControllers.cancelFriendship(req, res);
  })
);

export default router;
