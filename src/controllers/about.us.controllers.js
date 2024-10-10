import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { AboutUs } from "../models/about.us.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAboutUsSectionPost = asyncHandler(async (req, res) => {
  const aboutUsSectionData = await AboutUs.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!aboutUsSectionData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, aboutUsSectionData, "Data fetched successfully"));
});

const createAboutUsSectionPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log(title, description);

  if (!title || !description) {
    throw new apiError(400, "All fields are required");
  }

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const newPost = new AboutUs({
    title,
    description,
    image: image.secure_url,
    createdBy: req.admin._id,
  });

  await newPost.save();

  const createdAboutUsSection = await AboutUs.findById(newPost._id).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  if (!createdAboutUsSection) {
    throw new apiError(400, "Post not created");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, createdAboutUsSection, "Post created successfully")
    );
});

const updateAboutUsSectionPostPicture = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const previousImage = await AboutUs.findById(postId);

  if (!previousImage) {
    throw new apiError(400, "Post not found");
  }

  if (previousImage?.image) {
    await deleteFromCloudinary(previousImage?.image);
  }

  const updatedAboutUsSection = await AboutUs.findByIdAndUpdate(
    postId,
    {
      $set: {
        image: image.secure_url,
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

  if (!updatedAboutUsSection) {
    throw new apiError(400, "Post not updated");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedAboutUsSection, "Post updated successfully")
    );
});

const updateAboutUsSectionPostDetails = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, "All fields are required");
  }

  const updatedAboutUsSection = await AboutUs.findByIdAndUpdate(
    postId,
    {
      $set: {
        title,
        description,
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

  if (!updatedAboutUsSection) {
    throw new apiError(400, "Post not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedAboutUsSection, "Post updated successfully")
    );
});

const deleteAboutUsSectionPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const deletedAboutUsSection = await AboutUs.findByIdAndDelete(postId);

  if (!deletedAboutUsSection) {
    throw new apiError(400, "Post not found");
  }

  if (deletedAboutUsSection?.image) {
    await deleteFromCloudinary(deletedAboutUsSection?.image);
  }

  res
    .status(200)
    .json(
      new apiResponse(200, postId, "Post deleted successfully")
    );
});

export {
  getAboutUsSectionPost,
  createAboutUsSectionPost,
  updateAboutUsSectionPostPicture,
  updateAboutUsSectionPostDetails,
  deleteAboutUsSectionPost,
};
