const path = require("path");
const multer = require("multer");

const profileImageUploadDir = path.resolve(
  __dirname,
  "../../uploads/profile-images"
);

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, profileImageUploadDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeName = `profile-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    callback(null, safeName);
  },
});

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new Error("Only JPG, PNG, or WEBP images are allowed"));
    return;
  }

  callback(null, true);
};

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

module.exports = {
  uploadProfileImage,
};
