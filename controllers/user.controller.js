const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const {
  uploadToCloudinary,
  removeFromCloudinary,
  getPublicIdFromUrl,
} = require("../utils/cloudinary");
const fs = require("fs");

/**
 * Update user profile (bio + avatar)
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { bio, name } = req.body;
  const user = await prisma.users.findUnique({ where: { id: req.user.id } });

  if (!user) return next(new apiError("User not found", 404));

  let avatar = user.avatar;

  if (req.file) {
    // Delete old avatar if exists
    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) await removeFromCloudinary(publicId);
    }

    const uploadResult = await uploadToCloudinary(req.file.path, "avatars");
    avatar = uploadResult.secure_url;
    fs.unlinkSync(req.file.path);
  }

  const updatedUser = await prisma.users.update({
    where: { id: req.user.id },
    data: {
      bio,
      name,
      avatar,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      role: true,
      created_at: true,
    },
  });

  res.status(200).json(updatedUser);
});

/**
 * Upload / Update user avatar only
 * @route POST /api/users/avatar
 * @access Private
 */
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new apiError("Please upload an image", 400));

  const user = await prisma.users.findUnique({ where: { id: req.user.id } });

  if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    if (publicId) await removeFromCloudinary(publicId);
  }

  const uploadResult = await uploadToCloudinary(req.file.path, "avatars");
  const avatar = uploadResult.secure_url;
  fs.unlinkSync(req.file.path);

  const updatedUser = await prisma.users.update({
    where: { id: req.user.id },
    data: { avatar },
    select: { avatar: true },
  });

  res.status(200).json(updatedUser);
});

module.exports = {
  updateProfile,
  uploadAvatar,
};
