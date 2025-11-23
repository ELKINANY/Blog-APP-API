const { check, body } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const validatorMiddleware = require("../../middlewares/validator.middleware");

const createCommentValidator = [
  check("content").notEmpty().withMessage("Content is required"),
  check("postId")
    .notEmpty()
    .withMessage("Post ID is required")
    .isInt()
    .withMessage("Post ID must be an integer")
    .custom(async (value) => {
      const post = await prisma.posts.findUnique({
        where: { id: value },
      });
      if (!post) {
        return Promise.reject("Post not found");
      }
      return true;
    }),
  validatorMiddleware,
];

const updateCommentValidator = [
  check("content").optional().notEmpty().withMessage("Content cannot be empty"),
  validatorMiddleware,
];

module.exports = {
  createCommentValidator,
  updateCommentValidator,
};