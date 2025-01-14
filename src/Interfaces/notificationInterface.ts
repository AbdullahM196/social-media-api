import type { Request, Response } from "express";

interface notifications {
  sender: string;
  receiver: string;
  text: string;
  seen: boolean;
}

export default interface INotificationControllers {
  sendNotification(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
  getNotifications(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response>;
}
