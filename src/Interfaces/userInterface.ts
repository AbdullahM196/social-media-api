import { NextFunction, Request, Response } from "express";
import { Schema } from "mongoose";
export interface findUserType {
  status: number;
  data: IUser | string;
}
export interface IUser {
  _id: Schema.Types.ObjectId;
  username: string;
  phone?: string;
  email?: string;
  password?: string;
  token?: string;
  img?: {
    name: string;
    url: string;
  };
  googleSub?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface IGoogleData {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}
export interface IUserController {
  validateUserName(username: string): boolean;
  validateEmail(email: string): boolean;
  validatePhone(phone: string): boolean;
  validatePassword(password: string): boolean;
  findUserByUserName(userName: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserByPhone(phone: string): Promise<IUser | null>;
  hashPassword(password: string): Promise<string>;
  generateToken(username: string, expiresIn: string): Promise<string>;
  userInfoSentToFrontend(user: IUser): object;
  getUserDataFromGoogle(access_token: string): Promise<IGoogleData>;
  getUserById(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  registerUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  loginUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  signInGoogle(
    req: Request,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): Promise<void>;
  logoutUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getUserProfile(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  updateUserProfile(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
