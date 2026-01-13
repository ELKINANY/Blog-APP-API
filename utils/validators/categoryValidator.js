const { body, check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validator.middleware");

const createCategoryValidator = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("slug")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  validatorMiddleware,
];

const updateCategoryValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Category name cannot be empty"),
  body("slug")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  validatorMiddleware,
];

const checkIdValidator = [
  check("id").isUUID().withMessage("Invalid category ID"),
  validatorMiddleware,
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  checkIdValidator,
};
