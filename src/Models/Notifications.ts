import { Schema, model } from "mongoose";

const notifications = new Schema({
  sender: {
    ref: "User",
    type: Schema.ObjectId,
    required: true,
  },
  receiver: {
    ref: "User",
    type: Schema.ObjectId,
    required: true,
  },
  type: {
    postId: {
      type: Schema.ObjectId,
      ref: "Post",
      required: false,
    },
    commentId: {
      type: Schema.ObjectId,
      ref: "comment",
      required: false,
    },
  },
  text: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const notificationsModel = model("notifications", notifications);

export default notificationsModel;
