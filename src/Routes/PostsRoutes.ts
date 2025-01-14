import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import postsInstance from "../Controllers/PostsControllers";
import ImagesControllers from "../Controllers/ImagesControllers";
import AuthMiddleware from "../Middlewares/AuthMiddleware";

const router = Router();

router.post(
  "/",
  ImagesControllers.multerStorage.single("photo"),
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.addPost(req, res);
  })
);
router.patch(
  "/:postId",
  ImagesControllers.multerStorage.single("photo"),
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.updatePost(req, res);
  })
);
router.delete(
  "/:postId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.deletePost(req, res);
  })
);

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.getAllPosts(req, res);
  })
);
router.get(
  "/friendsPosts",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.getFriendsPosts(req, res);
  })
);
router.get(
  "/search",
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.searchPosts(req, res);
  })
);

router.post(
  "/react/:postId",
  AuthMiddleware.authenticateUsers,
  asyncHandler(async (req: Request, res: Response) => {
    await postsInstance.reactToPost(req, res);
  })
);

export default router;
