import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Category } from "../models/category.model.js";

const getCategories = asyncHandler(async (req, res) => {
  const categoryData = await Category.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!categoryData) {
    throw new apiError(404, "Categories not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, categoryData, "Data fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new apiError(400, "Category name is required");
  }

  const newCategory = new Category({
    name,
    createdBy: req.admin._id,
  });

  if (!newCategory) {
    throw new apiError(400, "Category creation failed");
  }

  await newCategory.save();

  const createdCategory = await Category.findById(newCategory._id).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  if (!createdCategory) {
    throw new apiError(400, "Category creation failed");
  }

  res
    .status(201)
    .json(
      new apiResponse(201, createdCategory, "Category created successfully")
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!categoryId) {
    throw new apiError(400, "Category is required");
  }

  if (!name) {
    throw new apiError(400, "Category name is required");
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name,
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedCategory) {
    throw new apiError(400, "Category update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedCategory, "Category updated successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new apiError(400, "Category is required");
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    throw new apiError(404, "Category not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, categoryId, "Category deleted successfully"));
});

export { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
};
