import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import { IUser } from "./userInterface";
export interface IPost {
  _id?: ObjectId;
  content?: string;
  author?: ObjectId | IUser;
  comments?: Array<ObjectId>;
  likes?: Array<ObjectId>;
  img?: {
    name: string;
    url: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
export type postResponse = {
  status: number;
  data: string | IPost;
};
interface IPostsController {
  getPostById(postId: ObjectId | any): Promise<postResponse>;
  addPost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  updatePost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  deletePost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getAllPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getFriendsPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  searchPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  reactToPost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
export default IPostsController;
