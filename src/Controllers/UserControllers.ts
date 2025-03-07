import { Response, Request, NextFunction } from "express";
import {
  findUserType,
  IGoogleData,
  IUser,
  IUserController,
} from "../Interfaces/userInterface";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { config } from "dotenv";
import ImagesControllers from "./ImagesControllers";
import mongoose, { ObjectId } from "mongoose";
import { OAuth2Client } from "google-auth-library";
import userModel from "../Models/userModel";
config();
class UserControllers implements IUserController {
  private static instance: UserControllers;
  private constructor(
    private readonly imgControllers: typeof ImagesControllers
  ) {}
  public static getInstance(): UserControllers {
    if (!UserControllers.instance) {
      UserControllers.instance = new UserControllers(ImagesControllers);
    }
    return UserControllers.instance;
  }
  async findUserByID(userId: ObjectId | string): Promise<findUserType> {
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

  validateUserName(username: string): boolean {
    const usernameRegex: RegExp = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return false;
    }
    return true;
  }
  validateEmail(email: string): boolean {
    const userEmailRegex: RegExp =
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!userEmailRegex.test(email)) {
      return false;
    }
    return true;
  }
  validatePhone(phone: string): boolean {
    const userPhoneRegex: RegExp = /^(010|011|012|015)[0-9]{8}$/;
    if (!userPhoneRegex.test(phone)) {
      return false;
    }
    return true;
  }
  validatePassword(password: string): boolean {
    const passwordRegEx: RegExp =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_.-@$!%*?&])[A-Za-z\d_.-@$!%*?&]{8,}$/;
    if (!passwordRegEx.test(password)) {
      return false;
    }
    return true;
  }
  async findUserByUserName(userName: string): Promise<IUser | null> {
    const user = await userModel.findOne({ username: userName });
    if (!user) {
      return null;
    } else {
      const userAsIUser = user.toObject() as IUser;
      return userAsIUser;
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return null;
    } else {
      const userAsIUser = user.toObject() as IUser;
      return userAsIUser;
    }
  }
  async findUserByPhone(phone: string): Promise<IUser | null> {
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return null;
    } else {
      const userAsIUser = user.toObject() as IUser;
      return userAsIUser;
    }
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  async generateToken(username: string, expiresIn: string): Promise<string> {
    const token = JWT.sign({ username }, process.env.JWT_SECRET!, {
      expiresIn: expiresIn,
    });
    return token;
  }
  userInfoSentToFrontend(user: IUser): object {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      img: user.img ? user.img : "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  async getUserDataFromGoogle(access_token: string): Promise<IGoogleData> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );
    const data = await response.json();
    return data;
  }
  async registerUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { username, email, phone, password }: IUser = req.body;
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validUsername = this.validateUserName(username);
    if (!validUsername) {
      return res
        .status(400)
        .json({ message: "Username can only contain letters and numbers" });
    }
    const duplicateUserName = await this.findUserByUserName(username);
    if (duplicateUserName) {
      return res.status(400).json({ message: "username is already Exists" });
    }
    const validEmail = this.validateEmail(email);
    if (!validEmail) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    const duplicateEmail = await this.findUserByEmail(email);
    if (duplicateEmail) {
      return res.status(400).json({ message: "Email is already Exists" });
    }
    const validPhone = this.validatePhone(phone);
    if (!validPhone) {
      return res.status(400).json({ message: "Phone is not valid" });
    }
    const duplicatePhone = await this.findUserByPhone(phone);
    if (duplicatePhone) {
      return res.status(400).json({ message: "Phone is already Exists" });
    }
    const validPassword = this.validatePassword(password);
    if (!validPassword) {
      return res.status(400).json({
        message:
          "Password must be at least one lowercase letter, one uppercase letter, one digit, one special character, and is at least 8 characters long",
      });
    }
    if (password === username || password === email) {
      return res
        .status(403)
        .json({ message: "Password can't be username or email" });
    }
    const hashedPassword = await this.hashPassword(password);
    const token = await this.generateToken(username, "7d");
    const user = await userModel.create({
      username,
      email,
      phone,
      password: hashedPassword,
      token,
    });
    const userAsIUser = user.toObject() as IUser;
    req.session.visited = true;
    req.session.user = userAsIUser;
    req.session.token = token;

    return res.status(201).json(this.userInfoSentToFrontend(userAsIUser));
  }
  async loginUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const { email, password }: IUser = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const validateEmail = this.validateEmail(email!);
    if (!validateEmail) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    const findUser = await this.findUserByEmail(email!);
    if (!findUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const matchPassword = await bcrypt.compare(password!, findUser.password!);
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = await this.generateToken(findUser.username!, "7d");
    await userModel
      .updateOne({ _id: findUser._id }, { $set: { token: token } })
      .exec();
    findUser.token = token;
    req.session.visited = true;
    req.session.user = findUser;
    req.session.token = token;

    return res.status(200).json(this.userInfoSentToFrontend(findUser));
  }

  async signInGoogle(
    req: Request,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const code: string = req.query.code!.toString();
      const redirectUrl = process.env.redirectUrl;
      const oauth2client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectUrl
      );
      const response = await oauth2client.getToken(code);
      await oauth2client.setCredentials(response.tokens);

      const user = oauth2client.credentials;
      const data = await this.getUserDataFromGoogle(user.access_token!);
      const findUser: IUser | null = await userModel.findOne({
        googleSub: data.sub,
      });
      // login or register by google .
      if (findUser) {
        const token = await this.generateToken(findUser.username!, "7d");
        await userModel.updateOne({ _id: findUser._id }, { $set: { token } });
        findUser.token = token;
        req.session.user = findUser;
        req.session.token = token;
      } else {
        const user = {
          username: data.name,
          googleSub: data.sub,
          img: { url: data.picture },
          token: "",
        };

        const token = await this.generateToken(user.username!, "7d");
        user.token = token;
        const newUser = new userModel(user);
        await newUser.save();
        req.session.user = newUser;
        req.session.token = token;
      }
      req.session.visited = true;
    } catch (error) {
      next(error);
    } finally {
      res.redirect(process.env.frontendUrl || "http://localhost:5173");
    }
  }

  async logoutUser(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const userSession = req.session;

    if (!userSession.token && !userSession.cookie) {
      return res.sendStatus(204);
    }
    await userModel.updateOne(
      { _id: userSession.user?._id },
      { $set: { token: "" } }
    );
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
    });
    res.clearCookie("connect.sid");
    return res.sendStatus(204);
  }
  async getUserProfile(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session.user!;
    if (!user) {
      return res.status(401).json({ message: "un Authorized" });
    }
    const currentUser: IUser = (await this.findUserByID(user._id!))
      .data as IUser;
    if (!currentUser) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json(this.userInfoSentToFrontend(currentUser));
  }
  async updateUserProfile(
    req: Request,
    res: Response<any, Record<string, any>>
  ): Promise<Response> {
    const user = req.session.user as IUser;
    const { email, phone, username } = req.body;
    const img = req.file;

    const saveImg = {
      name: "",
      url: "",
    };
    if (!user) {
      return res.status(401).json({
        message: "un Authorized User session expired, please log in again.",
      });
    }
    if (!email && !phone && !username && !img) {
      return res.status(400).json({ message: "add fields to update " });
    }
    const findUser = await userModel.findOne({ _id: user._id });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      const validUsername = this.validateUserName(username);
      if (!validUsername) {
        return res
          .status(400)
          .json({ message: "Username can only contain letters and numbers" });
      }
      const duplicateUserName = await this.findUserByUserName(username);
      if (duplicateUserName && user.username !== username) {
        return res.status(400).json({ message: "username is already Exists" });
      }
      req.session.user!.username = username;
      findUser.username = username;
    }
    if (email) {
      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res.status(400).json({ message: "Email is not valid" });
      }
      const duplicateEmail = await this.findUserByEmail(email);
      if (duplicateEmail && user.email !== email) {
        return res.status(400).json({ message: "Email is already Exists" });
      }
      (req.session.user as IUser)!.email = email;
      findUser.email = email;
    }
    if (phone) {
      const validPhone = this.validatePhone(phone);
      if (!validPhone) {
        return res.status(400).json({ message: "Phone is not valid" });
      }
      const duplicatePhone = await this.findUserByPhone(phone);
      if (duplicatePhone && user.phone !== phone) {
        return res.status(400).json({ message: "Phone is already Exists" });
      }
      (req.session.user as IUser)!.phone = phone;
      findUser.phone = phone;
    }
    if (img) {
      if (findUser?.img?.name) {
        const deleteImg = await this.imgControllers.deleteImage(
          findUser?.img?.name
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
      }

      req.session.user!.img = saveImg;
      findUser.img = saveImg;
    }

    await findUser.save();

    return res
      .status(201)
      .json(this.userInfoSentToFrontend(req.session.user! as IUser));
  }
  async getUserById(
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
    const findUser = (await userModel.findOne({ _id: userId })) as IUser;
    if (!findUser) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json(this.userInfoSentToFrontend(findUser));
  }
}
export default UserControllers.getInstance();
