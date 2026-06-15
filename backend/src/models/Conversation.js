import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: null,
    },
    groupImage: {
      type: String,
      default: null,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    theme: {
      color: {
        type: String,
        default: "#5B4CFF",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Conversation", conversationSchema);
