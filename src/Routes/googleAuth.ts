import { Request, Response, NextFunction, Router } from "express";
import asyncHandler from "express-async-handler";
import userInstance from "../Controllers/UserControllers";

const router = Router();

// get home page.
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await userInstance.signInGoogle(req, res, next);
  })
);
export default router;
