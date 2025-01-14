import { Request, Response } from "express";
import IPostsController, {
  IPost,
  postResponse,
} from "../Interfaces/PostInterface";
import postsModel from "../Models/postsModel";
import mongoose, { ObjectId } from "mongoose";
import ImagesControllers from "./ImagesControllers";
import savedPostModel from "../Models/savedPostModel";
import { IUser } from "../Interfaces/userInterface";
import FriendRequestControllers from "./FriendRequestControllers";
import userFriendsModel from "../Models/UserFriends";

class PostsControllers implements IPostsController {
  private constructor(
    private readonly imgControllers: typeof ImagesControllers,
    private readonly friendRequestControllers: typeof FriendRequestControllers
  ) {}
  private static instance: PostsControllers;
  public static getInstance(): PostsControllers {
    if (!this.instance) {
      this.instance = new PostsControllers(
        ImagesControllers,
        FriendRequestControllers
      );
      return this.instance;
    } else {
      return this.instance;
    }
  }
  async getPostById(postId: ObjectId | any): Promise<postResponse> {
    if (!mongoose.isValidObjectId(postId)) {
      return {
        status: 400,
        data: "Invalid id",
      };
    }
    const findPost = await postsModel.findOne({ _id: postId }).exec();
    if (!findPost) {
      return {
        status: 404,
        data: "post not found",
      };
    }
    const post = findPost.toObject() as IPost;
    return { status: 200, data: post };
  }
  async addPost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const author = req.session?.user;
    if (!author) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { content } = req.body;
    const img = req.file;
    const saveImg = {
      name: "",
      url: "",
    };
    if (!content) {
      return res.status(400).json({ message: "Content or img is Required" });
    }
    if (img) {
      const saveImage = await this.imgControllers.saveImage(img);
      if (saveImage.status === 500) {
        return res.status(500).json({ message: saveImage.error });
      } else if (saveImage.status === 201) {
        saveImg.name = saveImage.imgName!;
        saveImg.url = saveImage.downloadUrl!;
      }
    }

    const post = await postsModel.create({
      author,
      content,
      img: saveImg,
    });
    return res.status(201).json({ post });
  }
  async updatePost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { postId } = req.params;
    const { content } = req.body;
    const img = req.file;
    const saveImg = {
      name: "",
      url: "",
    };
    if (!postId) {
      return res.status(400).json({ message: "postId is Required" });
    }
    const findPost = await this.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData = findPost.data as IPost;
    if (findPostData.author!.toString() !== user._id.toString()) {
      return res.status(401).json({
        message: "un authorized, you don't have the right to edit this post",
      });
    }
    if (!content && !img) {
      return res.status(400).json({ message: "Content or img is Required" });
    }
    if (content) {
      findPostData.content = content;
    }
    if (img) {
      if (findPostData?.img?.name) {
        const deleteImg = await this.imgControllers.deleteImage(
          findPostData?.img?.name
        );
        if (deleteImg.status === 500) {
          return res.status(500).json({ message: deleteImg.message });
        }
      }
      const saveImage = await this.imgControllers.saveImage(img);
      if (saveImage.status === 500) {
        return res.status(500).json({ message: saveImage.error });
      } else if (saveImage.status === 201) {
        saveImg.name = saveImage.imgName!;
        saveImg.url = saveImage.downloadUrl!;
        findPostData.img = saveImg;
      }
    }

    await postsModel.updateOne(
      { _id: findPostData._id },
      { $set: { content: findPostData.content, img: findPostData.img } }
    );
    return res.status(201).json({ findPost: findPostData });
  }
  async deletePost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session.user!;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId is Required" });
    }
    const findPost = await this.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData = findPost.data as IPost;
    if (findPostData.author!.toString() !== user._id.toString()) {
      return res.status(401).json({
        message: "un authorized, you don't have the right to delete this post",
      });
    }
    if (
      findPostData.img?.name &&
      findPostData.img.url.startsWith("https://firebasestorage")
    ) {
      const deleteImg = await this.imgControllers.deleteImage(
        findPostData?.img?.name
      );
      if (deleteImg.status === 500) {
        return res.status(500).json({ message: deleteImg.message });
      }
    }
    await savedPostModel.deleteMany({ post: findPostData._id }).exec();
    await postsModel.deleteOne({ _id: findPostData._id }).exec();
    return res.sendStatus(204);
  }

  async getAllPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    let page = req.query.page as string;
    const pageNumber = page && !isNaN(parseInt(page)) ? parseInt(page) : 1;
    const totalDocument = await postsModel.countDocuments();
    const totalPages = Math.ceil(totalDocument / 20);

    const posts = await postsModel
      .find()
      .skip((pageNumber - 1) * 20)
      .limit(20)
      .sort({ createdAt: -1 })
      .populate("author", { _id: 1, username: 1, img: 1 });

    return res.status(200).json({ posts, totalPages });
  }
  async getFriendsPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session?.user!;
    req.params.userId = user._id!.toString();
    let page = req.query.page as string;
    const pageNumber = page && !isNaN(parseInt(page)) ? parseInt(page) : 1;

    const userFriends = await userFriendsModel.findOne({
      user: req.params.userId,
    });
    if (!userFriends) {
      return res.status(200).json({ posts: [] });
    }
    const totalDocument = await postsModel.countDocuments({
      author: userFriends.friends,
    });
    const totalPages = Math.ceil(totalDocument / 20);
    const friendsPosts = await postsModel
      .find({ author: userFriends.friends })
      .skip((pageNumber - 1) * 20)
      .limit(20)
      .sort({ createdAt: -1 })
      .populate("author", { _id: 1, username: 1, img: 1 });
    return res.status(200).json({ posts: friendsPosts, totalPages });
  }
  async searchPosts(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { username, userId, search } = req.query;
    if (username) {
      const findPosts: IPost[] = await postsModel
        .find()
        .sort({ createdAt: -1 })
        .populate("author", { _id: 1, username: 1, img: 1 });
      const posts = findPosts.filter((post) => {
        if (post.author) {
          const user = post.author as IUser;
          new RegExp(username as string, "i").test(user.username!);
        }
      });
      return res.status(200).json({ posts });
    } else if (userId && mongoose.isValidObjectId(userId)) {
      const totalDocument = await postsModel.countDocuments({
        author: userId,
      });
      const totalPages = Math.ceil(totalDocument / 20);
      const posts = await postsModel
        .find({ author: userId })
        .sort({ createdAt: -1 })
        .populate("author", { _id: 1, username: 1, img: 1 });
      return res.status(200).json({ posts, totalPages });
    } else if (search) {
      const posts = await postsModel
        .find({
          content: { $regex: search, $options: "i" },
        })
        .sort({ createdAt: -1 })
        .populate("author", { _id: 1, username: 1, img: 1 });
      return res.status(200).json({ posts });
    }
    return res.status(200).json({ posts: [] });
  }
  async reactToPost(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { postId } = req.params;
    const user = req.session.user!;
    if (!postId) {
      return res.status(400).json({ message: "You have to sent postId" });
    }
    const findPost = await this.getPostById(postId);
    if (findPost.status === 400 || findPost.status === 404) {
      return res.status(findPost.status).json({ message: findPost.data });
    }
    const findPostData = findPost.data as IPost;
    const isUserReact = findPostData.likes?.findIndex(
      (like) => like.toString() === user._id.toString()
    );
    if (isUserReact === -1) {
      findPostData.likes?.push(user._id);
      await postsModel.updateOne(
        { _id: findPostData._id },
        { $set: { likes: findPostData.likes } }
      );
    } else if (isUserReact! >= 0) {
      findPostData.likes?.splice(isUserReact!, 1);
      await postsModel.updateOne(
        {
          _id: findPostData._id,
        },
        {
          $set: { likes: findPostData.likes },
        }
      );
    }
    return res.status(201).json({ message: "created" });
  }
}
export default PostsControllers.getInstance();
