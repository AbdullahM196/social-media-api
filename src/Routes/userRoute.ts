import { Request, Response, Router } from "express";
import userInstance from "../Controllers/UserControllers";
import ImagesControllers from "../Controllers/ImagesControllers";
import asyncHandler from "express-async-handler";
import AuthMiddleware from "../Middlewares/AuthMiddleware";
const router = Router();
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.registerUser(req, res);
  })
);
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.loginUser(req, res);
  })
);
router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.logoutUser(req, res);
  })
);
router.get(
  "/profile",
  (req, res, next) => AuthMiddleware.authenticateUsers(req, res, next),
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.getUserProfile(req, res);
  })
);

router.patch(
  "/profile",
  ImagesControllers.multerStorage.single("photo"),
  (req, res, next) => AuthMiddleware.authenticateUsers(req, res, next),
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.updateUserProfile(req, res);
  })
);

router.get(
  "/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    await userInstance.getUserById(req, res);
  })
);

export default router;
