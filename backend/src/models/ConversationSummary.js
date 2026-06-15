import mongoose from "mongoose";

const conversationSummarySchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    keyPoints: [String],
    decisions: [String],
    actionItems: [String],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messageRangeStart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    messageRangeEnd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    type: {
      type: String,
      enum: ["auto", "manual"],
      default: "manual",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ConversationSummary", conversationSummarySchema);
