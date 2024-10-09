import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ChairmanMessage } from "../models/chairman.message.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getChairmanMessagePost = asyncHandler(async (req, res) => {
  const chairmanMessageData = await ChairmanMessage.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!chairmanMessageData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, chairmanMessageData, "Data fetched successfully")
    );
});

const createChairmanMessagePost = asyncHandler(async (req, res) => {
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

  const newPost = new ChairmanMessage({
    title,
    description,
    image: image.secure_url,
    createdBy: req.admin._id,
  });

  await newPost.save();

  const createdChairmanMessageSection = await ChairmanMessage.findById(
    newPost._id
  ).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  if (!createdChairmanMessageSection) {
    throw new apiError(400, "Post not created");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        createdChairmanMessageSection,
        "Post created successfully"
      )
    );
});

const updateChairmanMessagePostPicture = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const previousImage = await ChairmanMessage.findById(postId);

  if (!previousImage) {
    throw new apiError(400, "Post not found");
  }

  if (previousImage?.image) {
    await deleteFromCloudinary(previousImage?.image);
  }

  const updatedChairmanMessageSection = await ChairmanMessage.findByIdAndUpdate(
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

  if (!updatedChairmanMessageSection) {
    throw new apiError(400, "Post not updated");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedChairmanMessageSection,
        "Post updated successfully"
      )
    );
});

const updateChairmanMessagePostDetails = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, "All fields are required");
  }

  const updatedChairmanMessageSection = await ChairmanMessage.findByIdAndUpdate(
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

  if (!updatedChairmanMessageSection) {
    throw new apiError(400, "Post not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedChairmanMessageSection,
        "Post updated successfully"
      )
    );
});

const deleteChairmanMessagePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const deletedChairmanMessageSection =
    await ChairmanMessage.findByIdAndDelete(postId);

  if (!deletedChairmanMessageSection) {
    throw new apiError(400, "Post not found");
  }

  if (deletedChairmanMessageSection?.image) {
    await deleteFromCloudinary(deletedChairmanMessageSection?.image);
  }

  res
    .status(200)
    .json(new apiResponse(200, postId, "Post deleted successfully"));
});

export {
  getChairmanMessagePost,
  createChairmanMessagePost,
  updateChairmanMessagePostPicture,
  updateChairmanMessagePostDetails,
  deleteChairmanMessagePost,
};
