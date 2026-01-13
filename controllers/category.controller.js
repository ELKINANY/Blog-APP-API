const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const slugify = require("../utils/slugify");
const {
  uploadToCloudinary,
  removeFromCloudinary,
  getPublicIdFromUrl,
} = require("../utils/cloudinary");
const fs = require("fs");

const createCategory = asyncHandler(async (req, res, next) => {
  const { name, slug, description } = req.body;

  const existingCategory = await prisma.categories.findUnique({
    where: { name: name },
  });
  if (existingCategory) {
    return next(new apiError("Category already exists", 400));
  }

  let image = null;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.path, "categories");
    image = uploadResult.secure_url;
    fs.unlinkSync(req.file.path);
  }

  const generatedSlug = slugify(slug) || slugify(name);

  const newCategory = await prisma.categories.create({
    data: {
      name,
      slug: generatedSlug,
      description,
      image,
    },
  });
  res.status(201).json(newCategory);
});

const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await prisma.categories.findMany();
  res.status(200).json(categories);
});

const getCategoriesBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const category = await prisma.categories.findUnique({
    where: { slug: slug },
  });
  if (!category) {
    return next(new apiError("Category not found", 404));
  }
  res.status(200).json(category);
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  const category = await prisma.categories.findUnique({
    where: { id: id },
  });
  if (!category) {
    return next(new apiError("Category not found", 404));
  }

  let image = category.image;
  if (req.file) {
    if (category.image) {
      const publicId = getPublicIdFromUrl(category.image);
      if (publicId) await removeFromCloudinary(publicId);
    }
    const uploadResult = await uploadToCloudinary(req.file.path, "categories");
    image = uploadResult.secure_url;
    fs.unlinkSync(req.file.path);
  }

  const updatedCategory = await prisma.categories.update({
    where: { id: id },
    data: {
      name,
      slug: slug || (name ? slugify(name) : undefined),
      description,
      image,
    },
  });
  res.status(200).json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await prisma.categories.findUnique({
    where: { id: id },
  });
  if (!category) {
    return next(new apiError("Category not found", 404));
  }

  if (category.image) {
    const publicId = getPublicIdFromUrl(category.image);
    if (publicId) await removeFromCloudinary(publicId);
  }

  await prisma.categories.delete({ where: { id: id } });
  res.status(200).json({ message: "Category deleted successfully" });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesBySlug,
  updateCategory,
  deleteCategory,
};
