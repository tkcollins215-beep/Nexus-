import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { audioUpload } from "../middleware/upload.js";
import ActionItem from "../models/ActionItem.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// REACTIONS: Add/remove reaction to message
router.post(
  "/:conversationId/messages/:messageId/react",
  authMiddleware,
  async (req, res) => {
    try {
      const { emoji } = req.body;
      if (!emoji) return res.status(400).json({ error: "Emoji is required" });

      const message = await Message.findById(req.params.messageId);
      if (!message) return res.status(404).json({ error: "Message not found" });

      const existingReaction = message.reactions.find((r) => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.users.includes(req.userId)) {
          existingReaction.users = existingReaction.users.filter(
            (u) => u.toString() !== req.userId,
          );
        } else {
          existingReaction.users.push(req.userId);
        }
      } else {
        message.reactions.push({ emoji, users: [req.userId] });
      }

      await message.save();
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// BOOKMARKS: Bookmark/unbookmark message
router.post(
  "/:conversationId/messages/:messageId/bookmark",
  authMiddleware,
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);
      if (!message) return res.status(404).json({ error: "Message not found" });

      const isBookmarked = message.bookmarkedBy.includes(req.userId);
      if (isBookmarked) {
        message.bookmarkedBy = message.bookmarkedBy.filter(
          (u) => u.toString() !== req.userId,
        );
      } else {
        message.bookmarkedBy.push(req.userId);
      }

      await message.save();
      res.json({ bookmarked: !isBookmarked });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// BOOKMARKS: Get user's bookmarked messages in conversation
router.get("/:conversationId/bookmarks", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      bookmarkedBy: req.userId,
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// THREADS: Get thread replies for a message
router.get(
  "/:conversationId/messages/:messageId/thread",
  authMiddleware,
  async (req, res) => {
    try {
      const parentMessage = await Message.findById(
        req.params.messageId,
      ).populate("sender", "username email avatar");

      if (!parentMessage)
        return res.status(404).json({ error: "Message not found" });

      const replies = await Message.find({ replyTo: req.params.messageId })
        .populate("sender", "username email avatar")
        .sort({ createdAt: 1 });

      res.json({ parentMessage, replies });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// REMINDERS: Create reminder for message
router.post(
  "/:conversationId/messages/:messageId/remind",
  authMiddleware,
  async (req, res) => {
    try {
      const { remindAt } = req.body;
      if (!remindAt)
        return res.status(400).json({ error: "remindAt is required" });

      const reminder = new Reminder({
        userId: req.userId,
        messageId: req.params.messageId,
        conversationId: req.params.conversationId,
        remindAt: new Date(remindAt),
      });

      await reminder.save();
      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// REMINDERS: Get user's reminders
router.get("/reminders/list", authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId })
      .populate("messageId")
      .populate("conversationId", "groupName")
      .sort({ remindAt: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REMINDERS: Mark reminder as completed
router.put(
  "/:conversationId/reminders/:reminderId/complete",
  authMiddleware,
  async (req, res) => {
    try {
      const reminder = await Reminder.findByIdAndUpdate(
        req.params.reminderId,
        { isCompleted: true, completedAt: new Date() },
        { new: true },
      );

      if (!reminder)
        return res.status(404).json({ error: "Reminder not found" });
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// SEARCH: Search messages in conversation
router.get("/:conversationId/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const messages = await Message.find({
      conversationId: req.params.conversationId,
      $or: [
        { content: { $regex: query, $options: "i" } },
        { "sender.username": { $regex: query, $options: "i" } },
      ],
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PINNED: Pin/unpin message
router.post(
  "/:conversationId/messages/:messageId/pin",
  authMiddleware,
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(
        req.params.conversationId,
      );
      if (!conversation)
        return res.status(404).json({ error: "Conversation not found" });

      const isPinned = conversation.pinnedMessages.includes(
        req.params.messageId,
      );
      if (isPinned) {
        conversation.pinnedMessages = conversation.pinnedMessages.filter(
          (id) => id.toString() !== req.params.messageId,
        );
      } else {
        conversation.pinnedMessages.push(req.params.messageId);
      }

      await conversation.save();
      res.json({ pinned: !isPinned });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PINNED: Get pinned messages
router.get("/:conversationId/pinned", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId,
    ).populate("pinnedMessages");

    if (!conversation)
      return res.status(404).json({ error: "Conversation not found" });

    const pinnedMessages = await Message.find({
      _id: { $in: conversation.pinnedMessages },
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 });

    res.json(pinnedMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTION ITEMS: Create action item
router.post(
  "/:conversationId/action-items",
  authMiddleware,
  async (req, res) => {
    try {
      const { messageId, text, assignedTo, dueDate, priority } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const actionItem = new ActionItem({
        conversationId: req.params.conversationId,
        messageId,
        text,
        assignedTo: assignedTo || [],
        extractedBy: req.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "medium",
      });

      await actionItem.save();
      res.status(201).json(actionItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ACTION ITEMS: Get action items for conversation
router.get(
  "/:conversationId/action-items",
  authMiddleware,
  async (req, res) => {
    try {
      const actionItems = await ActionItem.find({
        conversationId: req.params.conversationId,
      })
        .populate("assignedTo", "username email avatar")
        .populate("extractedBy", "username email avatar")
        .sort({ dueDate: 1 });

      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ACTION ITEMS: Update action item status
router.put(
  "/:conversationId/action-items/:itemId",
  authMiddleware,
  async (req, res) => {
    try {
      const { isCompleted } = req.body;
      const actionItem = await ActionItem.findByIdAndUpdate(
        req.params.itemId,
        {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        { new: true },
      );

      if (!actionItem)
        return res.status(404).json({ error: "Action item not found" });
      res.json(actionItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// EXISTING ENDPOINTS BELOW

// Get all conversations for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate("participants", "username email avatar status")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get conversation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { participantIds, isGroupChat, groupName } = req.body;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: "Participant IDs are required" });
    }

    const uniqueParticipantIds = [
      ...new Set(participantIds.map((id) => String(id))),
    ].filter((id) => id !== String(req.userId));

    if (isGroupChat) {
      if (!groupName?.trim()) {
        return res.status(400).json({ error: "Group name is required" });
      }
      if (uniqueParticipantIds.length < 2) {
        return res
          .status(400)
          .json({ error: "Select at least 2 members for a group chat" });
      }
    }

    const allParticipants = [req.userId, ...uniqueParticipantIds];

    // For 1-to-1 chats, check if conversation already exists
    if (!isGroupChat && uniqueParticipantIds.length === 1) {
      const existingConversation = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants },
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      isGroupChat,
      groupName: isGroupChat ? groupName : null,
      admins: isGroupChat ? [req.userId] : [],
    });

    await conversation.save();
    await conversation.populate("participants", "username email avatar status");

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation by ID with messages
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants", "username email avatar status")
      .populate("lastMessage");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    if (
      !conversation.participants.some((p) => p._id.toString() === req.userId)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: 1 });

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send voice message
router.post(
  "/:conversationId/messages/audio",
  authMiddleware,
  audioUpload.single("audio"),
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { duration } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      if (!conversation.participants.some((p) => p.toString() === req.userId)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const mediaUrl = `/uploads/audio/${req.file.filename}`;
      const content = duration ? String(duration) : "Voice message";

      const message = new Message({
        conversationId,
        sender: req.userId,
        content,
        mediaUrl,
        mediaType: "audio",
      });

      await message.save();
      await message.populate("sender", "username email avatar");

      conversation.lastMessage = message._id;
      await conversation.save();

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Send message
router.post("/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, mediaUrl, mediaType } = req.body;

    if (!content && !mediaUrl) {
      return res
        .status(400)
        .json({ error: "Message content or media is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const message = new Message({
      conversationId,
      sender: req.userId,
      content,
      mediaUrl,
      mediaType,
    });

    await message.save();
    await message.populate("sender", "username email avatar");

    // Update conversation's last message
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put("/:conversationId/read", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        "readBy.userId": { $ne: req.userId },
      },
      {
        $push: {
          readBy: {
            userId: req.userId,
            readAt: new Date(),
          },
        },
      },
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete(
  "/:conversationId/messages/:messageId",
  authMiddleware,
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.sender.toString() !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await Message.findByIdAndDelete(req.params.messageId);

      res.json({ message: "Message deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Edit message
router.put(
  "/:conversationId/messages/:messageId",
  authMiddleware,
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.sender.toString() !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
