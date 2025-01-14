import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ConversationControllers from "../Controllers/ConversationControllers";
import AuthMiddleware from "../Middlewares/AuthMiddleware";
const router = Router();

router.post(
  "/:receiverId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.createConversation(req, res);
  })
);
router.get(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.getConversations(req, res);
  })
);
router.get(
  "/:conversationId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await ConversationControllers.getConversation(req, res);
  })
);

export default router;
