import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "document", null],
      default: null,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: Date,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        emoji: String,
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reminders: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        remindAt: Date,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    actionItems: [
      {
        text: String,
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dueDate: Date,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    searchIndex: String,
  },
  { timestamps: true },
);

messageSchema.index({ content: "text", searchIndex: "text" });

export default mongoose.model("Message", messageSchema);
