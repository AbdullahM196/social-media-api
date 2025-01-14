import asyncHandler from "express-async-handler";
import { Request, Response, Router } from "express";
import CommentControllersInstance from "../Controllers/CommentControllers";
import AuthMiddleware from "../Middlewares/AuthMiddleware";
const router = Router();

router.post(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await CommentControllersInstance.addComment(req, res);
  })
);
router.get(
  "/:postId",
  asyncHandler(async (req: Request, res: Response) => {
    await CommentControllersInstance.getPostComments(req, res);
  })
);
router.patch(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await CommentControllersInstance.updateComment(req, res);
  })
);
router.delete(
  "/:commentId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await CommentControllersInstance.deleteComment(req, res);
  })
);
router.post(
  "/:commentId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await CommentControllersInstance.reactToComment(req, res);
  })
);

export default router;
