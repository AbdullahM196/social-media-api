import mongoose, { Schema, model } from "mongoose";

const ConversationSchema = new Schema({
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
});

const ConversationModel = model("Conversation", ConversationSchema);
export default ConversationModel;
