import IFriendRequestInterface, {
  IFriendRequest,
  IUserFriends,
} from "../Interfaces/FriendRequestInterface";
import friendRequestsModel from "../Models/friendRequestsModel";
import { Request, Response } from "express";
import { IUser } from "../Interfaces/userInterface";
import mongoose, { ObjectId } from "mongoose";
import userModel from "../Models/userModel";
import userFriendsModel from "./../Models/UserFriends";
type findUserType = {
  status: number;
  data: IUser | string;
};
type findUserRequestType = {
  status: number;
  data: IFriendRequest | string;
};
class FriendRequestController implements IFriendRequestInterface {
  private static instance: FriendRequestController;
  public static getInstance(): FriendRequestController {
    if (!FriendRequestController.instance) {
      FriendRequestController.instance = new FriendRequestController();
      return FriendRequestController.instance;
    } else {
      return FriendRequestController.instance;
    }
  }
  async findUserByID(userId: string | ObjectId): Promise<findUserType> {
    const response = {
      status: 200,
      data: "",
    };
    if (!mongoose.isValidObjectId(userId)) {
      response.status = 400;
      response.data = "Invalid id";
      return response;
    }
    const findUser = await userModel.findOne({ _id: userId }).exec();
    if (!findUser) {
      response.status = 404;
      response.data = "user not found";
      return response;
    }
    const user = findUser.toObject() as IUser;
    return {
      status: 200,
      data: user,
    };
  }
  async findUserRequests(
    userId: ObjectId,
    receiverId: ObjectId
  ): Promise<findUserRequestType> {
    const response: findUserRequestType = {
      status: 200,
      data: "",
    };

    const friendRequest = await friendRequestsModel
      .findOne({
        $or: [
          { sender: userId, receiver: receiverId },
          { sender: receiverId, receiver: userId },
        ],
      })
      .exec();

    if (friendRequest) {
      const request = friendRequest;
      response.data = request;
      response.status = 200;
    } else {
      response.status = 404;
      response.data = "This user did not send you a friend request.";
    }

    return response;
  }
  async sendFriendRequest(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.user!;
    if (!user) {
      return res.status(401).json({ message: "You Have To Login First" });
    }
    const findUser = await this.findUserByID(user._id!);
    if (findUser.status !== 200) {
      return res.status(findUser.status).json(findUser.data);
    }
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }

    if (receiverId.toString() === user._id!.toString()) {
      return res.status(400).json({
        message: "It is no't allowed to send friend request to the same user",
      });
    }
    const receiver = await this.findUserByID(receiverId);
    if (receiver.status !== 200) {
      return res.status(receiver.status).json(receiver.data);
    }
    const receiverData = receiver.data as IUser;

    const existingRequest = await this.findUserRequests(
      user._id!,
      receiverData._id!
    );

    const userFriends: IUserFriends | null = await userFriendsModel.findOne({
      user: user._id,
    });
    const isALreadyFriends =
      userFriends && userFriends.friends.includes(receiverId) ? true : false;
    if (existingRequest.status === 200 || isALreadyFriends) {
      return res.status(400).json({
        message: "A friend request already exists or you are already friends.",
      });
    }
    const friendRequest = await friendRequestsModel.create({
      sender: user._id,
      receiver: receiverData._id,
    });

    return res.status(201).json({
      friendRequest: {
        _id: friendRequest._id,
        sender: { _id: user._id, username: user.username, img: user.img },
        receiver: {
          _id: receiverData._id,
          username: receiverData.username,
          img: receiverData.img,
        },
      },
    });
  }
  async getFriendRequests(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req?.user;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    try {
      const userFriendsRequests = await friendRequestsModel
        .find({ $or: [{ sender: user._id }, { receiver: user._id }] })
        .populate("sender", { username: 1, "img.url": 1 })
        .populate("receiver", { username: 1, "img.url": 1 });
      if (!userFriendsRequests) {
        return res
          .status(404)
          .json({ message: "There is not a Friend Requests" });
      }
      return res.status(200).json(userFriendsRequests);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
  async getFriendRequestsSentByUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const currentUser = req.user!;
    const userRequests = await friendRequestsModel
      .find({ sender: currentUser._id })
      .populate("sender", { username: 1, "img.url": 1 })
      .populate("receiver", { username: 1, "img.url": 1 });
    return res.status(200).json({ data: userRequests });
  }
  async cancelFriendsRequestSentByUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { id } = req.params;
    const currentUser = req.user!;
    const findRequest = await friendRequestsModel.findById(id);
    if (!findRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (findRequest.sender.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ message: "Denied You are not a sender" });
    }
    await friendRequestsModel.deleteOne({ _id: id });
    return res.status(204).json({ message: "deleted" });
  }
  async manageFriendRequests(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.user!;
    const { isAccepted, senderId } = req.body;
    if (!user) {
      return res.status(401).json({ message: "you have to login first" });
    }
    if (!isAccepted || !senderId) {
      return res
        .status(404)
        .json({ message: "you have to send isAccepted and senderId" });
    }
    const acceptance = ["true", "false"];
    if (!acceptance.includes(isAccepted)) {
      return res.status(400).json({
        message: "you have to send and isAccepted is true or false",
      });
    }
    const friendRequests = await friendRequestsModel.findOne({
      sender: senderId,
      receiver: user._id,
    });
    if (!friendRequests) {
      return res.status(404).json({
        message:
          "This user Dose not send you a friend request and you cannot accept your friend request",
      });
    }

    if (isAccepted === "true") {
      await userFriendsModel.updateOne(
        { user: user._id },
        {
          $addToSet: { friends: senderId },
        },
        {
          upsert: true,
        }
      );
      await userFriendsModel.updateOne(
        { user: senderId },
        {
          $addToSet: { friends: user._id },
        },
        {
          upsert: true,
        }
      );
    }
    await friendRequestsModel.deleteOne({
      sender: senderId,
      receiver: user._id,
    });

    return res.status(201).json({ message: "created" });
  }
  async findUserFriends(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "you should send userId" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json({ message: "user not found" });
    }
    const findUserFriends =
      (await userFriendsModel
        .findOne({ user: userId })
        .populate("friends", { _id: 1, username: 1, img: 1 })) || [];

    return res.status(200).json({ findUserFriends });
  }
  async cancelFriendship(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { userId } = req.params;
    const user = req.user!;
    if (!user) {
      return res
        .status(401)
        .json({ message: "unAuthorized you have to login first" });
    }
    const findUser = await this.findUserByID(userId);
    if (findUser.status !== 200) {
      return res.status(findUser.status).json({ message: findUser.data });
    }
    const findUserData = findUser.data as IUser;
    const userFriends: IUserFriends | null = await userFriendsModel.findOne({
      user: user._id,
    });
    if (!userFriends) {
      return res
        .status(404)
        .json({ message: "This user dose not have friends" });
    }
    const isFriends = userFriends.friends.includes(findUserData._id!);
    if (!isFriends) {
      return res.status(403).json({ message: "Denied You are not a friends" });
    }
    await userFriendsModel
      .updateOne(
        { user: user._id },
        {
          $pull: { friends: userId },
        }
      )
      .exec();
    await userFriendsModel.updateOne(
      { user: userId },
      {
        $pull: { friends: user._id },
      }
    );
    return res.status(204).json({ message: "deleted" });
  }
}
export default FriendRequestController.getInstance();
