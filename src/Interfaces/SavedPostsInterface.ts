import { Request, Response } from "express";
import { ObjectId } from "mongoose";

export type savedPostType = {
  _id: ObjectId;
  user: ObjectId;
  post: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
};
export default interface ISavedPosts {
  toggleFavPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getSavedPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
