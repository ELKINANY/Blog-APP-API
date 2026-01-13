const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

const createComment = asyncHandler(async (req, res, next) => {
  const { postId, content } = req.body;

  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return next(new apiError("Post not found", 404));
  }

  const newComment = await prisma.comments.create({
    data: {
      content,
      author_id: req.user.id,
      post_id: postId,
    },
  });

  res.status(201).json(newComment);
});

const getCommentsByPostId = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return next(new apiError("Post not found", 404));
  }

  const comments = await prisma.comments.findMany({
    where: { post_id: postId },
  });

  res.status(200).json(comments);
});

const updateComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await prisma.comments.findUnique({
    where: { id },
  });

  if (!comment) {
    return next(new apiError("Comment not found", 404));
  }

  if (comment.author_id !== req.user.id) {
    return next(new apiError("Not authorized to update this comment", 403));
  }

  const updatedComment = await prisma.comments.update({
    where: { id },
    data: { content },
  });

  res.status(200).json(updatedComment);
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await prisma.comments.findUnique({
    where: { id },
  });

  if (!comment) {
    return next(new apiError("Comment not found", 404));
  }

  await prisma.comments.delete({
    where: { id },
  });

  res.status(204).send();
});

module.exports = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};