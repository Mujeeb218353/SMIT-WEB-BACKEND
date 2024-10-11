import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Alumni } from "../models/alumni.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAlumni = asyncHandler(async (req, res) => {
  const alumniData = await Alumni.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!alumniData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, alumniData, "Data fetched successfully"));
});

const createAlumni = asyncHandler(async (req, res) => {
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

  const newAlumni = await Alumni.create({
    name,
    description,
    designation,
    profile: profile.secure_url,
    createdBy: req.admin._id,
  });

  if (!newAlumni) {
    throw new apiError(400, "Alumni creation failed");
  }

  const createdAlumni = await Alumni.findById(newAlumni._id).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  res
    .status(201)
    .json(new apiResponse(201, createdAlumni, "Alumni created successfully"));
});

const updateAlumniPicture = asyncHandler(async (req, res) => {
  const { alumniId } = req.params;

  const profilePath = req.file.path;

  if (!alumniId) {
    throw new apiError(400, "Alumni not found");
  }

  if (!profilePath) {
    throw new apiError(400, "Profile is required");
  }

  const profile = await uploadOnCloudinary(profilePath);

  if (!profile) {
    throw new apiError(400, "Profile upload failed");
  }

  const previousProfile = await Alumni.findById(alumniId);

  if (!previousProfile) {
    throw new apiError(400, "Alumni not found");
  }

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  const updatedAlumni = await Alumni.findByIdAndUpdate(
    alumniId,
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
    .json(new apiResponse(200, updatedAlumni, "Profile updated successfully"));
});

const updateAlumniDetails = asyncHandler(async (req, res) => {
  const { alumniId } = req.params;

  const { name, description, designation } = req.body;

  if (!alumniId) {
    throw new apiError(400, "Alumni not found");
  }

  if (!name || !description || !designation) {
    throw new apiError(400, "All fields are required");
  }

  const updatedAlumni = await Alumni.findByIdAndUpdate(
    alumniId,
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

  if (!updatedAlumni) {
    throw new apiError(400, "Alumni update failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedAlumni, "Alumni updated successfully"));
});

const deleteAlumni = asyncHandler(async (req, res) => {
  const { alumniId } = req.params;

  if (!alumniId) {
    throw new apiError(400, "Alumni not found");
  }

  const deletedAlumni = await Alumni.findByIdAndDelete(alumniId);

  if (!deletedAlumni) {
    throw new apiError(400, "Alumni not found");
  }

  if (deletedAlumni?.profile) {
    await deleteFromCloudinary(deletedAlumni?.profile);
  }

  res
    .status(200)
    .json(new apiResponse(200, alumniId, "Alumni deleted successfully"));
});

export {
  getAlumni,
  createAlumni,
  updateAlumniPicture,
  updateAlumniDetails,
  deleteAlumni,
};
