import { Schema, model } from "mongoose";
import { IFriendRequest } from "src/Interfaces/FriendRequestInterface";

const friendRequestsSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const friendsRequestModel = model("friendRequest", friendRequestsSchema);

export default friendsRequestModel;
