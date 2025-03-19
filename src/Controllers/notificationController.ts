import { Request, Response } from "express";
import INotificationControllers from "../Interfaces/notificationInterface";
import UserControllers from "./UserControllers";
import notificationsModel from "../Models/Notifications";
import { IUser } from "../Interfaces/userInterface";
import PostsControllers from "./PostsControllers";
import { IPost } from "../Interfaces/PostInterface";
import CommentControllers from "./CommentControllers";
type notificationRequest = {
  receiver: string;
  type: {
    postId: string;
    commentId?: string;
  };
  text: string;
};
class notificationController implements INotificationControllers {
  private constructor(
    private userController: typeof UserControllers,
    private postsController: typeof PostsControllers,
    private commentController: typeof CommentControllers
  ) {}
  private static instance: notificationController;

  public static getInstance(): notificationController {
    if (!this.instance) {
      this.instance = new notificationController(
        UserControllers,
        PostsControllers,
        CommentControllers
      );
      return this.instance;
    } else {
      return this.instance;
    }
  }
  async sendNotification(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.user!;
    const { receiver, type, text }: notificationRequest = req.body;
    if (!receiver || !text) {
      return res.status(400).json({
        message: "receiver , text and type.model are required",
      });
    }
    const findReceiver = await this.userController.findUserByID(receiver);
    if (findReceiver.status !== 200) {
      return res.status(findReceiver.status).json(findReceiver.data);
    }
    const receiverUser = findReceiver.data as IUser;
    const findPost = await this.postsController.getPostById(type.postId);
    if (type.postId && findPost.status !== 200) {
      return res.status(findPost.status).json(findPost.data);
    }
    const findPostData = findPost.data as IPost;
    if (type.commentId) {
      const findComment = await this.commentController.getCommentById(
        type.commentId
      );
      if (findComment.status !== 200) {
        return res.status(findComment.status).json(findComment.data);
      }
    }
    const notification = {
      sender: user._id,
      receiver: receiverUser._id,
      text,
      type: {
        postId: findPostData._id,
        commentId: type.commentId,
      },
    };
    const newNotification = await notificationsModel.create(notification);
    return res.status(200).json({ data: newNotification });
  }
  async getNotifications(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const currentUser = req.user!;
    const allNotifications = await notificationsModel
      .find({
        receiver: currentUser._id,
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", { username: 1, "img.url": 1 });

    return res.status(200).json({ data: allNotifications });
  }
}

export default notificationController.getInstance();
