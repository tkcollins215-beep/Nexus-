import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const avatarsDir = path.join(__dirname, "../../uploads/avatars");
export const groupImagesDir = path.join(__dirname, "../../uploads/groups");
export const audioDir = path.join(__dirname, "../../uploads/audio");

fs.mkdirSync(avatarsDir, { recursive: true });
fs.mkdirSync(groupImagesDir, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: avatarsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${req.userId}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed"));
  }
};

export const audioUpload = multer({
  storage: multer.diskStorage({
    destination: audioDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".m4a";
      cb(null, `audio-${req.params.conversationId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: audioFilter,
});

export const groupImageUpload = multer({
  storage: multer.diskStorage({
    destination: groupImagesDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `group-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});
