import { NextFunction, Request, Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import asyncHandler from "express-async-handler";
const router = Router();
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const redirectUrl = process.env.redirectUrl;
    const oauth2client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );
    const authorizeUrl = oauth2client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/userinfo.profile openid",
      prompt: "consent",
    });
    console.log({ authorizeUrl });
    res.json({ url: authorizeUrl });
  })
);
export default router;
