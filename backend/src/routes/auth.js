import express from "express";
import { authMiddleware, generateToken } from "../middleware/auth.js";
import { avatarUpload } from "../middleware/upload.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";

function formatUser(user) {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    lastSeen: user.lastSeen,
  };
}

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(" ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Identifier and password are required" });
    }

    // Find user by email, username, or phone
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update status to online
    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload profile photo
router.post(
  "/:userId/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  async (req, res) => {
    try {
      if (req.userId !== req.params.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const avatar = `/uploads/avatars/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { avatar },
        { new: true, runValidators: true },
      ).select("-password");

      res.json(formatUser(user));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user profile
router.put("/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { username, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { username, bio, avatar },
      { new: true, runValidators: true },
    ).select("-password");

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { status: "offline", lastSeen: new Date() },
      { new: true },
    );

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
