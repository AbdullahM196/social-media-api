import { config } from "dotenv";
import { NextFunction, Request, Response } from "express";
config();
const allowedOrigins = process.env.Allowed_Origins?.split(",");

export default (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (allowedOrigins?.includes(origin!)) {
    res.setHeader("Access-Control-Allow-Origin", origin!);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  } else {
    next();
  }
};
