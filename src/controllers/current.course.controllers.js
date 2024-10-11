import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { CurrentCourse } from "../models/current.course.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getCurrentCourses = asyncHandler(async (req, res) => {
  const currentCourseData = await CurrentCourse.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!currentCourseData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, currentCourseData, "Data fetched successfully"));
});

const createCurrentCourse = asyncHandler(async (req, res) => {
  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const newCurrentCourse = new CurrentCourse({
    image: image.secure_url,
    createdBy: req.admin._id,
  });

  await newCurrentCourse.save();

  const createdCurrentCourse = await CurrentCourse.findById(
    newCurrentCourse._id
  ).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  if (!createdCurrentCourse) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, createdCurrentCourse, "Data fetched successfully")
    );
});

const updateCurrentCourse = asyncHandler(async (req, res) => {
  const { currentCourseId } = req.params;

  if (!currentCourseId) {
    throw new apiError(400, "Course not found");
  }

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const updatedCurrentCourse = await CurrentCourse.findByIdAndUpdate(
    currentCourseId,
    {
      image: image.secure_url,
      updatedBy: req.admin._id,
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

  if (!updatedCurrentCourse) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedCurrentCourse,
        "Current Course updated successfully"
      )
    );
});

const deleteCurrentCourse = asyncHandler(async (req, res) => {
  const { currentCourseId } = req.params;

  if (!currentCourseId) {
    throw new apiError(400, "Course not found");
  }

  const deletedCurrentCourse =
    await CurrentCourse.findByIdAndDelete(currentCourseId);

  if (!deletedCurrentCourse) {
    throw new apiError(400, "Course not found");
  }

  if (deletedCurrentCourse?.image) {
    await deleteFromCloudinary(deletedCurrentCourse?.image);
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        currentCourseId,
        "Current Course deleted successfully"
      )
    );
});

export {
  getCurrentCourses,
  createCurrentCourse,
  updateCurrentCourse,
  deleteCurrentCourse,
};
