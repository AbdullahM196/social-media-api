import express, { Application, NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import DBConnect from "./Config/DBConnect";
import sessions from "./Middlewares/sessions";
import userRouter from "./Routes/userRoute";
import postsRouter from "./Routes/PostsRoutes";
import commentRouter from "./Routes/commentRoutes";
import friendRequestRoute from "./Routes/friendRequestRoutes";
import favPostsRoutes from "./Routes/favPostsRoutes";
import conversationRoute from "./Routes/conversationRoutes";
import messagesRoutes from "./Routes/messagesRoutes";
import NotificationRoutes from "./Routes/notificationRoute";
import ErrorHandler from "./Middlewares/ErrorHandler";
import corsOptions from "./Config/cors";
import cors from "cors";
import credentials from "./Config/credentials";
import helmet from "helmet";
import path from "path";
import { xss } from "express-xss-sanitizer";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import googleAuth from "./Routes/googleAuth";
import googleAuthorizeUrl from "./Routes/requestUrl";
config();
DBConnect.getInstance().ConnectDB();

const app: Application = express();
const port = process.env.PORT || 3000;
app.use(cors(corsOptions));
// app.use(credentials);
app.use(express.json());
app.use(sessions);
// Set up Helmet for security headers.
app.use(helmet());
// sanitize data
app.use(mongoSanitize());
// Prevent XSS Attacks
app.use(xss());

// prevent http param pollution.
app.use(hpp());
app.use(express.static(path.join(__dirname, "public")));
app.use("/oauth", googleAuth);
app.use("/requestUrl", googleAuthorizeUrl);
app.use("/user", userRouter);
app.use("/friendRequest", friendRequestRoute);
app.use("/favPosts", favPostsRoutes);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);
app.use("/conversation", conversationRoute);
app.use("/messages", messagesRoutes);
app.use("/notification", NotificationRoutes);

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handleError);
app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});
