import { model, Schema } from "mongoose";
import { savedPostType } from "src/Interfaces/SavedPostsInterface";

const savedPostSchema = new Schema<savedPostType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const savedPostModel = model("SavedPost", savedPostSchema);
export default savedPostModel;
