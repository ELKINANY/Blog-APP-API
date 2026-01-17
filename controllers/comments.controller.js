const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

/**
 * Create Comment OR Reply
 */
const createComment = asyncHandler(async (req, res, next) => {
  const { postId, content, parentId } = req.body;

  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return next(new apiError("Post not found", 404));
  }

  // If it's a reply, make sure parent comment exists
  if (parentId) {
    const parent = await prisma.comments.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return next(new apiError("Parent comment not found", 404));
    }
  }

  const newComment = await prisma.comments.create({
    data: {
      content,
      post_id: postId,
      user_id: req.user.id,
      parent_id: parentId || null,
      isApproved: req.user.role === "admin", // auto approve admins
    },
    include: {
      users: {
        select: { name: true, avatar: true },
      },
    },
  });

  res.status(201).json(newComment);
});

/**
 * Get comments for a post (Nested)
 */
const getCommentsByPostId = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return next(new apiError("Post not found", 404));
  }

  const comments = await prisma.comments.findMany({
    where: {
      post_id: postId,
      parent_id: null,
      isApproved: true,
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      users: {
        select: { name: true, avatar: true },
      },
      replies: {
        where: { isApproved: true },
        orderBy: { created_at: "asc" },
        include: {
          users: {
            select: { name: true, avatar: true },
          },
        },
      },
    },
  });

  res.status(200).json(comments);
});

/**
 * Update comment
 */
const updateComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await prisma.comments.findUnique({
    where: { id },
  });

  if (!comment) {
    return next(new apiError("Comment not found", 404));
  }

  if (comment.user_id !== req.user.id) {
    return next(new apiError("Not authorized", 403));
  }

  const updatedComment = await prisma.comments.update({
    where: { id },
    data: { content, isApproved: false }, // needs re-approval after edit
  });

  res.status(200).json(updatedComment);
});

/**
 * Delete comment (owner or admin)
 */
const deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await prisma.comments.findUnique({
    where: { id },
  });

  if (!comment) {
    return next(new apiError("Comment not found", 404));
  }

  if (comment.user_id !== req.user.id && req.user.role !== "admin") {
    return next(new apiError("Not authorized", 403));
  }

  await prisma.comments.delete({
    where: { id },
  });

  res.status(204).send();
});

/**
 * Admin approve comment
 */
const approveComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await prisma.comments.update({
    where: { id },
    data: { isApproved: true },
  });

  res.status(200).json(comment);
});

module.exports = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
  approveComment,
};
