import { Request, Response, NextFunction } from "src/expressType";
import { User } from "../models/User"; // Adjust the path to your User model
import { IUser } from "src/Interfaces/userInterface";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
