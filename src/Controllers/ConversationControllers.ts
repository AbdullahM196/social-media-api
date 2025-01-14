import {
  IConversation,
  IMessage,
  IConversationController,
  getConversationByIdType,
  getMessageType,
} from "./../Interfaces/conversationInterface";
import ConversationModel from "../Models/ConversationModel";
import messageModel from "../Models/Messages";
import { Request, Response } from "express";
import { IUser } from "../Interfaces/userInterface";
import UserControllers from "./UserControllers";
import mongoose, { ObjectId } from "mongoose";
import ImagesControllers from "./ImagesControllers";
class ConversationController implements IConversationController {
  private static instance: ConversationController;
  public static getInstance(): ConversationController {
    if (!ConversationController.instance) {
      ConversationController.instance = new ConversationController(
        UserControllers,
        ImagesControllers
      );
      return ConversationController.instance;
    }
    return ConversationController.instance;
  }
  private constructor(
    private userController: typeof UserControllers,
    private imgControllers: typeof ImagesControllers
  ) {}

  async getConversationById(
    conversationId: ObjectId | any
  ): Promise<getConversationByIdType> {
    if (!mongoose.isValidObjectId(conversationId)) {
      return {
        status: 400,
        data: "Invalid id",
      };
    }
    const conversation: IConversation | null = await ConversationModel.findOne({
      _id: conversationId,
    });
    if (!conversation) {
      return {
        status: 404,
        data: "Conversation not found",
      };
    }
    return {
      status: 200,
      data: conversation,
    };
  }
  async getMessagesById(messageId: ObjectId | any): Promise<getMessageType> {
    if (!mongoose.isValidObjectId(messageId)) {
      return {
        status: 400,
        data: "Invalid id",
      };
    }
    const message: IMessage | null = await messageModel.findOne({
      _id: messageId,
    });
    if (!message) {
      return {
        status: 404,
        data: "Message not found",
      };
    }
    return {
      status: 200,
      data: message,
    };
  }

  async createConversation(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "un Authorized" });
    }
    const { receiverId } = req.params;
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }
    const findUser = await this.userController.findUserByID(receiverId);
    if (findUser.status === 400 || findUser.status === 404) {
      return res.status(findUser.status).json({ message: findUser.data });
    }
    const receiver = findUser.data as IUser;

    const existingConversation = await ConversationModel.findOne({
      members: { $all: [user._id, receiver._id] },
    });

    if (!existingConversation) {
      const newConversation = await ConversationModel.create({
        members: [user._id, receiver._id],
      });
      await newConversation.save();
      return res.status(201).json(newConversation);
    }

    return res.status(201).json({ message: "conversation already Exist" });
  }
  async getConversations(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    const conversations = await ConversationModel.find({
      members: user._id,
    });

    return res.status(200).json(conversations);
  }
  async getConversation(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session.user!;
    const { conversationId } = req.params;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    const conversation = await this.getConversationById(conversationId);
    if (conversation.status !== 200) {
      return res
        .status(conversation.status)
        .json({ message: conversation.data });
    }
    const conversationData: IConversation = conversation.data as IConversation;
    const isUserIsaMember = conversationData.members.find((member) => {
      return member.toString() === user._id.toString();
    });
    if (!isUserIsaMember) {
      return res
        .status(401)
        .json({ message: "You are not a member of this conversation" });
    }
    return res.status(200).json(conversationData);
  }
  async addMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { conversationId, text } = req.body;
    console.log({ conversationId, text });
    const img = req.file;
    const saveImg = {
      name: "",
      url: "",
    };
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    if (!conversationId || !text) {
      return res
        .status(400)
        .json({ message: "conversationId and text are required" });
    }
    const conversation = await this.getConversationById(conversationId);
    if (conversation.status !== 200) {
      return res
        .status(conversation.status)
        .json({ message: conversation.data });
    }
    const conversationData: IConversation = conversation.data as IConversation;
    const isUserIsaMember = conversationData.members.find(
      (member) => member.toString() === user._id!.toString()
    );
    if (!isUserIsaMember) {
      return res
        .status(401)
        .json({ message: "You are not a member of this conversation" });
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
    const newMessage = await messageModel.create({
      conversationId,
      senderId: user._id,
      text,
      img: saveImg,
    });
    return res.status(201).json(newMessage);
  }
  async getMessages(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { conversationId } = req.params;
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }
    const conversation = await this.getConversationById(conversationId);
    if (conversation.status !== 200) {
      return res
        .status(conversation.status)
        .json({ message: conversation.data });
    }
    const conversationData: IConversation = conversation.data as IConversation;
    const isUserIsaMember = conversationData.members.some(
      (member) => member.toString() === user._id!.toString()
    );
    if (!isUserIsaMember) {
      return res
        .status(401)
        .json({ message: "You are not a member of this conversation" });
    }
    const allMessages = await messageModel.find({
      conversationId: conversationData._id,
    });
    return res.status(200).json(allMessages);
  }
  async deleteMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { messageId } = req.params;
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }

    const message = await this.getMessagesById(messageId);
    if (message.status !== 200) {
      return res.status(message.status).json({ message: message.data });
    }
    const messageData: IMessage = message.data as IMessage;
    if (user._id !== messageData.senderId) {
      return res
        .status(401)
        .json({ message: "you don't have the right to delete this message" });
    }

    await messageModel.findByIdAndDelete(messageData._id);

    return res.status(204).json({ message: "Deleted" });
  }
  async updateMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { messageId } = req.params;
    const { text } = req.body;
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "You have to login first" });
    }
    if (!messageId || !text) {
      return res
        .status(400)
        .json({ message: "messageId and text are required" });
    }

    const message = await this.getMessagesById(messageId);
    if (message.status !== 200) {
      return res.status(message.status).json({ message: message.data });
    }
    const messageData: IMessage = message.data as IMessage;
    if (user._id !== messageData.senderId) {
      return res
        .status(401)
        .json({ message: "you don't have the right to update this message" });
    }

    await messageModel.updateOne({ _id: messageData._id }, { $set: { text } });

    return res.status(201).json({ message: "updated" });
  }
}
export default ConversationController.getInstance();
