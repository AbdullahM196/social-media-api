import { Request, Response } from "express";
import { ObjectId } from "mongoose";

interface IConversation {
  _id: ObjectId;
  members: ObjectId[];
}
interface getConversationByIdType {
  status: number;
  data: IConversation | string;
}
interface getMessageType {
  status: number;
  data: IMessage | string;
}
interface IMessage {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface IConversationController {
  getConversationById(
    conversationId: ObjectId | any
  ): Promise<getConversationByIdType>;
  getMessagesById(messageId: ObjectId | any): Promise<getMessageType>;
  createConversation(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getConversations(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getConversation(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  addMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getMessages(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  deleteMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  updateMessage(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}

export {
  IConversation,
  getMessageType,
  IMessage,
  IConversationController,
  getConversationByIdType,
};
