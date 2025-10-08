const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res, next) => {
  const { name, slug } = req.body;
  const existingCategory = await prisma.categories.findUnique({
    where: { name: name },
  });
  if (existingCategory) {
    return next(new apiError("Category already exists", 400));
  }
  const newCategory = await prisma.categories.create({
    data: { name, slug },
  });
  res.status(201).json(newCategory);
});

const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await prisma.categories.findMany();
  res.status(200).json(categories);
});

const getCategoriesById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await prisma.categories.findUnique({
    where: { id: id },
  });
  if (!category) {
    return next(new apiError("Category not found", 404));
  }
  res.status(200).json(category);
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  const category = await prisma.categories.findUnique({
    where: { id: id },
  });
  if (!category) {
    return next(new apiError("Category not found", 404));
  }
  const updatedCategory = await prisma.categories.update({
    where: { id: id },
    data: { name, slug },
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
  await prisma.categories.delete({ where: { id: id } });
  res.status(200).json({ message: "Category deleted successfully" });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesById,
  updateCategory,
  deleteCategory,
};
