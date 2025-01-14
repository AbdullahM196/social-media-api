import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import SavedPostsController from "../Controllers/SavedPostsController";
import AuthMiddleware from "../Middlewares/AuthMiddleware";
const router = Router();
router.post(
  "/:postId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await SavedPostsController.toggleFavPosts(req, res);
  })
);
router.get(
  "/",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await SavedPostsController.getSavedPosts(req, res);
  })
);

export default router;
