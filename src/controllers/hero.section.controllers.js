import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { HeroSectionPost } from "../models/hero.section.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getHeroSectionPosts = asyncHandler(async (req, res) => {
  const heroSectionData = await HeroSectionPost.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!heroSectionData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, heroSectionData, "Data fetched successfully"));
});

const createHeroSectionPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

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

  const newPost = new HeroSectionPost({
    title,
    description,
    image: image.secure_url,
    createdBy: req.admin._id,
  });

  await newPost.save();

  const createdHeroSection = await HeroSectionPost.findById(
    newPost._id
  ).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  console.log(createdHeroSection);

  if (!createdHeroSection) {
    throw new apiError(400, "Post creation failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, createdHeroSection, "Post created successfully")
    );
});

const updateHeroSectionPostPicture = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const previousImage = await HeroSectionPost.findById(postId);

  if (!previousImage) {
    throw new apiError(400, "Post not found");
  }

  if (previousImage?.image) {
    await deleteFromCloudinary(previousImage?.image);
  }

  const updatedHeroSection = await HeroSectionPost.findByIdAndUpdate(
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

  if (!updatedHeroSection) {
    throw new apiError(400, "Image update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedHeroSection, "Image updated successfully")
    );
});

const updateHeroSectionPostDetails = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, "All fields are required");
  }

  const updatedHeroSection = await HeroSectionPost.findByIdAndUpdate(
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

  if (!updatedHeroSection) {
    throw new apiError(400, "Details update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedHeroSection, "Details updated successfully")
    );
});

const deleteHeroSectionPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const deletedPost = await HeroSectionPost.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new apiError(400, "Post not found");
  }

  if (deletedPost?.image) {
    await deleteFromCloudinary(deletedPost?.image);
  }

  res
    .status(200)
    .json(new apiResponse(200, postId, "Post deleted successfully"));
});

export {
  getHeroSectionPosts,
  createHeroSectionPost,
  updateHeroSectionPostDetails,
  updateHeroSectionPostPicture,
  deleteHeroSectionPost,
};
