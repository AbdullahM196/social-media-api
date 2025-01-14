import session from "express-session";
import { Session } from "express-session";
import { IUser } from "./src/Interfaces/userInterface.ts";

declare module "express-session" {
  interface SessionData {
    user?: IUser;
    visited?: Boolean;
    token?: string;
  }
}
