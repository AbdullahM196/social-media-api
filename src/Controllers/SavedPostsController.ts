import { Request, Response } from "express";
import savedPostModel from "../Models/savedPostModel";
import userModel from "../Models/userModel";
import PostsControllers from "./PostsControllers";
import { IPost } from "../Interfaces/PostInterface";
import ISavedPosts, { savedPostType } from "../Interfaces/SavedPostsInterface";
import { IUser } from "../Interfaces/userInterface";
class SavedPostsController implements ISavedPosts {
  private static instance: SavedPostsController;
  private constructor(private postsControllers: typeof PostsControllers) {}
  public static getInstance(): SavedPostsController {
    if (!SavedPostsController.instance) {
      SavedPostsController.instance = new SavedPostsController(
        PostsControllers
      );
    }
    return SavedPostsController.instance;
  }
  async toggleFavPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { postId } = req.params;
    const user = req?.user;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    const findPost = await this.postsControllers.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData: IPost = findPost.data as IPost;
    const findUser: IUser | null = await userModel.findOne({ _id: user._id });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const findSavedPost: savedPostType | null = await savedPostModel.findOne({
      user: findUser._id,
      post: findPostData._id,
    });
    if (findSavedPost) {
      await savedPostModel.deleteOne({ _id: findSavedPost._id });
    } else {
      await savedPostModel.create({
        user: findUser._id,
        post: findPostData._id,
      });
    }

    return res.status(201).json({ message: "created" });
  }
  async getSavedPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req?.user;
    if (!user) {
      return res.status(401).json({ message: "you have to login first" });
    }
    const findUser: IUser | null = await userModel.findOne({ _id: user._id });
    if (!findUser) {
      return res.status(404).json({ message: "user not found" });
    }
    const savedPosts: savedPostType[] | null = await savedPostModel
      .find({
        user: findUser._id,
      })
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "username img",
        },
      });

    if (!savedPosts) {
      return res.status(404).json({ message: "saved posts not found" });
    }
    return res.status(200).json({ savedPosts });
  }
}
export default SavedPostsController.getInstance();
