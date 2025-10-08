const { check, body } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../apiError");
const validatorMiddleware = require("../../middlewares/validator.middleware");

const createPostValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("content").notEmpty().withMessage("Content is required"),
  body("categories")
    .isArray()
    .withMessage("Categories must be an array")
    .optional(),
  body("categories.*")
    .custom(async (value) => {
      const category = await prisma.categories.findUnique({
        where: { id: value },
      });
      if (!category) {
        return Promise.reject("Category not found");
      }
      return true;
    })
    .optional(),
  validatorMiddleware,
];

const updatePostValidation = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("categories")
    .isArray()
    .withMessage("Categories must be an array")
    .optional(),
  body("categories.*")
    .custom(async (value) => {
      const category = await prisma.categories.findUnique({
        where: { id: value },
      });
      if (!category) {
        return Promise.reject("Category not found");
      }
      return true;
    })
    .optional(),
  validatorMiddleware,
];

module.exports = {
  createPostValidation,
  updatePostValidation,
};
