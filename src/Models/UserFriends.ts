import { model, Schema } from "mongoose";

const userFriendSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const userFriendsModel = model("userFriend", userFriendSchema);
export default userFriendsModel;
