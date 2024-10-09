import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { EducationChairmanMessage } from "../models/education.chairman.message.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getEducationChairmanMessagePost = asyncHandler(async (req, res) => {
    const educationChairmanMessageData = await EducationChairmanMessage.find()
      .populate({
        path: "createdBy",
        select: "name email profile phoneNumber",
      })
      .populate({
        path: "updatedBy",
        select: "name email profile phoneNumber",
      });
  
    if (!educationChairmanMessageData) {
      throw new apiError(404, "Data not found");
    }
  
    res
      .status(200)
      .json(
        new apiResponse(200, educationChairmanMessageData, "Data fetched successfully")
      );
  });
  
  const createEducationChairmanMessagePost = asyncHandler(async (req, res) => {
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
  
    const newPost = new EducationChairmanMessage({
      title,
      description,
      image: image.secure_url,
      createdBy: req.admin._id,
    });
  
    await newPost.save();
  
    const createdEducationChairmanMessageSection = await EducationChairmanMessage.findById(
      newPost._id
    ).populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    });
  
    if (!createdEducationChairmanMessageSection) {
      throw new apiError(400, "Post not created");
    }
  
    res
      .status(200)
      .json(
        new apiResponse(
          200,
          createdEducationChairmanMessageSection,
          "Post created successfully"
        )
      );
  });
  
  const updateEducationChairmanMessagePostPicture = asyncHandler(async (req, res) => {
    const { postId } = req.params;
  
    const imageLocalPath = req.file?.path;
  
    if (!imageLocalPath) {
      throw new apiError(400, "Image is required");
    }
  
    const image = await uploadOnCloudinary(imageLocalPath);
  
    if (!image) {
      throw new apiError(400, "Image upload failed");
    }
  
    const previousImage = await EducationChairmanMessage.findById(postId);
  
    if (!previousImage) {
      throw new apiError(400, "Post not found");
    }
  
    if (previousImage?.image) {
      await deleteFromCloudinary(previousImage?.image);
    }
  
    const updatedEducationChairmanMessageSection = await EducationChairmanMessage.findByIdAndUpdate(
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
  
    if (!updatedEducationChairmanMessageSection) {
      throw new apiError(400, "Post not updated");
    }
  
    res
      .status(200)
      .json(
        new apiResponse(
          200,
          updatedEducationChairmanMessageSection,
          "Post updated successfully"
        )
      );
  });
  
  const updateEducationChairmanMessagePostDetails = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { title, description } = req.body;
  
    if (!title || !description) {
      throw new apiError(400, "All fields are required");
    }
  
    const updatedEducationChairmanMessageSection = await EducationChairmanMessage.findByIdAndUpdate(
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
  
    if (!updatedEducationChairmanMessageSection) {
      throw new apiError(400, "Post not found");
    }
  
    res
      .status(200)
      .json(
        new apiResponse(
          200,
          updatedEducationChairmanMessageSection,
          "Post updated successfully"
        )
      );
  });
  
  const deleteEducationChairmanMessagePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
  
    const deletedEducationChairmanMessageSection =
      await EducationChairmanMessage.findByIdAndDelete(postId);
  
    if (!deletedEducationChairmanMessageSection) {
      throw new apiError(400, "Post not found");
    }
  
    if (deletedEducationChairmanMessageSection?.image) {
      await deleteFromCloudinary(deletedEducationChairmanMessageSection?.image);
    }
  
    res
      .status(200)
      .json(new apiResponse(200, postId, "Post deleted successfully"));
  });

export {
    getEducationChairmanMessagePost,
    createEducationChairmanMessagePost,
    updateEducationChairmanMessagePostPicture,
    updateEducationChairmanMessagePostDetails,
    deleteEducationChairmanMessagePost
};