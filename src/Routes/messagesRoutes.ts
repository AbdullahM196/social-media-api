import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ConversationControllers from "../Controllers/ConversationControllers";
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import ImagesControllers from "../Controllers/ImagesControllers";
const router = Router();
router.post(
  "/",
  AuthMiddleware.authenticateUsers,
  ImagesControllers.multerStorage.single("photo"),
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.addMessage(req, res);
  })
);
router.get(
  "/:conversationId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.getMessages(req, res);
  })
);
router.delete(
  "/:messageId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.deleteMessage(req, res);
  })
);
router.patch(
  "/:messageId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.updateMessage(req, res);
  })
);

export default router;
