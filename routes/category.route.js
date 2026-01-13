const router = require("express").Router();

const {
  createCategory,
  getAllCategories,
  getCategoriesById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const {
  createCategoryValidator,
  updateCategoryValidator,
  checkIdValidator,
} = require("../utils/validators/categoryValidator");

const { protect, allowedTo } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/",
  protect,
  allowedTo("admin"),
  upload.single("image"),
  createCategoryValidator,
  createCategory
);
router.get("/", getAllCategories);
router.get("/:id", checkIdValidator, getCategoriesById);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  upload.single("image"),
  updateCategoryValidator,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  checkIdValidator,
  deleteCategory
);

module.exports = router;
