import { Request, Response } from "express";
import { ObjectId } from "mongoose";
export interface IFriendRequest {
  _id: ObjectId;
  sender: ObjectId;
  receiver: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export interface IUserFriends {
  _id: ObjectId;
  user: ObjectId;
  friends: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
export default interface IFriendRequestModel {
  sendFriendRequest(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getFriendRequests(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  manageFriendRequests(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getFriendRequestsSentByUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  cancelFriendsRequestSentByUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  findUserFriends(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  cancelFriendship(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
