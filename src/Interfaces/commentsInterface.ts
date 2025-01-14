import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import { IUser } from "./userInterface";
import { IPost } from "./PostInterface";

export interface IComment {
  _id?: ObjectId;
  content: string;
  author: ObjectId | IUser;
  postId: ObjectId | IPost;
  likes: Array<ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
export type getCommentByIdResponse = {
  status: number;
  data: string | IPost;
};
export default interface ICommentController {
  getCommentById(commentId: ObjectId | any): Promise<getCommentByIdResponse>;
  addComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getPostComments(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  updateComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  deleteComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  reactToComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
