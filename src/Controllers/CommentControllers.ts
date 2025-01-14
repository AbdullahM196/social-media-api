import ICommentControllers, {
  getCommentByIdResponse,
  IComment,
} from "../Interfaces/commentsInterface";
import { Request, Response } from "express";
import PostsControllers from "./PostsControllers";
import { IPost } from "../Interfaces/PostInterface";
import commentModel from "../Models/commentsModel";
import postsModel from "../Models/postsModel";
import mongoose, { ObjectId } from "mongoose";

class CommentsControllers implements ICommentControllers {
  private static instance: CommentsControllers;
  public static getInstance(): CommentsControllers {
    if (!this.instance) {
      this.instance = new CommentsControllers();
      return this.instance;
    } else {
      return this.instance;
    }
  }
  async getCommentById(
    commentId: ObjectId | any
  ): Promise<getCommentByIdResponse> {
    if (!mongoose.isValidObjectId(commentId)) {
      return {
        status: 400,
        data: "Invalid id",
      };
    }
    const findComment = await commentModel.findOne({ _id: commentId }).exec();
    if (!findComment) {
      return {
        status: 404,
        data: "Comment not found",
      };
    }
    const Comment = findComment;
    return { status: 200, data: Comment };
  }
  async addComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { postId, content } = req.body;
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "you have to login first" });
    }
    if (!postId) {
      return res.status(400).json({ message: "You have to send the postId" });
    }
    if (!content) {
      return res.status(400).json({ message: "You have to send the Content" });
    }
    const findPost = await PostsControllers.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData = findPost.data as IPost;
    const newComments = await commentModel.create({
      author: user._id,
      postId: findPostData._id,
      content,
    });
    const newCommentData = newComments;
    findPostData.comments?.push(newCommentData._id!);
    await postsModel.updateOne(
      { _id: findPostData._id },
      { $set: { comments: findPostData.comments } }
    );
    return res.status(201).json({ newComment: newCommentData });
  }
  async getPostComments(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { postId } = req.params;
    const findPost = await PostsControllers.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData = findPost.data as IPost;
    const comments = await commentModel
      .find({ postId: findPostData._id })
      .sort({ createdAt: -1 })
      .populate("author", { _id: 1, username: 1, img: 1 });
    return res.status(200).json({ comments });
  }
  async updateComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { commentId, content } = req.body;
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "you have to login first" });
    }
    if (!commentId) {
      return res
        .status(400)
        .json({ message: "You have to send the commentId" });
    }
    if (!content) {
      return res.status(400).json({ message: "You have to send the Content" });
    }
    const findComment = await this.getCommentById(commentId);
    if (findComment.status === 400 || findComment.status === 404) {
      return res.status(findComment.status).json({ message: findComment.data });
    }
    const findCommentData = findComment.data as IComment;
    if (user._id.toString() !== findCommentData.author?.toString()) {
      return res
        .status(401)
        .json({ message: "You Don't have the right to Edit this Comment" });
    }
    findCommentData.content = content;
    await commentModel.updateOne(
      { _id: findCommentData._id },
      { $set: { content } }
    );

    return res.status(201).json({ updatedComment: findCommentData });
  }
  async deleteComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { commentId } = req.params;
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "you have to login first" });
    }
    if (!commentId) {
      return res
        .status(400)
        .json({ message: "You have to send the commentId" });
    }

    const findComment = await this.getCommentById(commentId);
    if (findComment.status === 400 || findComment.status === 404) {
      return res.status(findComment.status).json({ message: findComment.data });
    }
    const findCommentData = findComment.data as IComment;

    if (user._id.toString() !== findCommentData.author?.toString()) {
      return res
        .status(401)
        .json({ message: "You Don't have the right to Delete this Comment" });
    }

    const findPost = await PostsControllers.getPostById(findCommentData.postId);
    const findPostData = findPost.data as IPost;

    findPostData.comments = findPostData.comments?.filter(
      (comment) => comment.toString() !== commentId
    );
    await postsModel.updateOne(
      { _id: findPostData._id },
      { $set: { comments: findPostData.comments } }
    );
    await commentModel.deleteOne({ _id: findCommentData._id });
    return res.sendStatus(204);
  }
  async reactToComment(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { commentId } = req.params;
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    if (!commentId) {
      return res.status(400).json({ message: "You have to sent commentId" });
    }
    const findComment = await this.getCommentById(commentId);
    if (findComment.status === 400 || findComment.status === 404) {
      return res.status(findComment.status).json({ message: findComment.data });
    }
    const findCommentData = findComment.data as IPost;
    const isUserReact = findCommentData.likes?.findIndex(
      (like) => like.toString() === user._id.toString()
    );
    if (isUserReact === -1) {
      findCommentData.likes?.push(user._id);
      await commentModel.updateOne(
        { _id: findCommentData._id },
        { $set: { likes: findCommentData.likes } }
      );
    } else if (isUserReact! >= 0) {
      findCommentData.likes?.splice(isUserReact!, 1);
      await commentModel.updateOne(
        {
          _id: findCommentData._id,
        },
        {
          $set: { likes: findCommentData.likes },
        }
      );
    }
    return res.status(201).json({ message: "Created" });
  }
}

export default CommentsControllers.getInstance();
