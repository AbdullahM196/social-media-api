import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import UserControllers from "../Controllers/UserControllers";
import userModel from "../Models/userModel";

class AuthMiddleWare {
  private static instance: AuthMiddleWare;
  private userController: typeof UserControllers;
  private constructor(userController: typeof UserControllers) {
    this.userController = userController;
  }
  public static getInstance(): AuthMiddleWare {
    if (!AuthMiddleWare.instance) {
      AuthMiddleWare.instance = new AuthMiddleWare(UserControllers);
    }
    return AuthMiddleWare.instance;
  }
  async authenticateUsers(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "unAuthorized Missing token" });
    }
    try {
      const decoded = Jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string;
      };
      if (!decoded) {
        return res.status(401).json({ message: "unAuthorized Invalid token" });
      }
      req.user = await userModel
        .findOne({ username: decoded.username })
        .select("-password")
        .exec();
      next();
    } catch (error) {
      return res.status(401).json({ message: error });
    }
  }
}
export default AuthMiddleWare.getInstance();
