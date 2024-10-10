import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Instructor } from "../models/instructor.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getInstructors = asyncHandler(async (req, res) => {
  const instructorData = await Instructor.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!instructorData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, instructorData, "Data fetched successfully"));
});

const createInstructor = asyncHandler(async (req, res) => {
  const { name, description, designation } = req.body;

  if (!name || !description || !designation) {
    throw new apiError(400, "All fields are required");
  }

  const profilePath = req.file?.path;

  if (!profilePath) {
    throw new apiError(400, "Profile is required");
  }

  const profile = await uploadOnCloudinary(profilePath);

  if (!profile) {
    throw new apiError(400, "Profile upload failed");
  }

  const newInstructor = await Instructor.create({
    name,
    description,
    designation,
    profile: profile.secure_url,
    createdBy: req.admin._id,
  });

  if (!newInstructor) {
    throw new apiError(400, "Instructor creation failed");
  }

  const createdInstructor = await Instructor.findById(
    newInstructor._id
  ).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  res
    .status(201)
    .json(
      new apiResponse(201, createdInstructor, "Instructor created successfully")
    );
});

const updateInstructorPicture = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;

  const profilePath = req.file.path;

  if (!instructorId) {
    throw new apiError(400, "Instructor not found");
  }

  if (!profilePath) {
    throw new apiError(400, "Profile is required");
  }

  const profile = await uploadOnCloudinary(profilePath);

  if (!profile) {
    throw new apiError(400, "Profile upload failed");
  }

  const previousProfile = await Instructor.findById(instructorId);

  if (!previousProfile) {
    throw new apiError(400, "Instructor not found");
  }

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  const updatedInstructor = await Instructor.findByIdAndUpdate(
    instructorId,
    {
      $set: {
        profile: profile.secure_url,
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

  res
    .status(200)
    .json(
      new apiResponse(200, updatedInstructor, "Profile updated successfully")
    );
});

const updateInstructorDetails = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;

  const { name, description, designation } = req.body;

  if (!instructorId) {
    throw new apiError(400, "Instructor not found");
  }

  if (!name || !description || !designation) {
    throw new apiError(400, "All fields are required");
  }

  const updatedInstructor = await Instructor.findByIdAndUpdate(
    instructorId,
    {
      $set: {
        name,
        description,
        designation,
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

  if (!updatedInstructor) {
    throw new apiError(400, "Instructor update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedInstructor, "Instructor updated successfully")
    );
});

const deleteInstructor = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;

  if (!instructorId) {
    throw new apiError(400, "Instructor not found");
  }

  const deletedInstructor = await Instructor.findByIdAndDelete(instructorId);

  if (!deletedInstructor) {
    throw new apiError(400, "Instructor not found");
  }

  if (deletedInstructor?.profile) {
    await deleteFromCloudinary(deletedInstructor?.profile);
  }

  res
    .status(200)
    .json(
      new apiResponse(200, deletedInstructor, "Instructor deleted successfully")
    );
});

export {
  getInstructors,
  createInstructor,
  updateInstructorPicture,
  updateInstructorDetails,
  deleteInstructor,
};
