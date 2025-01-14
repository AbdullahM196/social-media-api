import { model, Schema } from "mongoose";
import { IUser } from "../Interfaces/userInterface";

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: "",
    },
    googleSub: {
      type: String,
    },
    img: {
      name: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
  },
  {
    discriminatorKey: "userAuth",
    timestamps: true,
  }
);

const userModel = model("User", UserSchema);
export default userModel;
