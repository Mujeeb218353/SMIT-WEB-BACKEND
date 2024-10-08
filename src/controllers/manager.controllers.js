import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Manager } from "../models/manager.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { populate } from "dotenv";

const getManagers = asyncHandler(async (req, res) => {
  const managerData = await Manager.find()
    .populate({
      path: "campus",
      select: "name",
      populate: {
        path: "city",
        select: "name",
        populate: {
          path: "country",
          select: "name",
        },
      },
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!managerData) {
    throw new apiError(404, "Managers not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, managerData, "Managers fetched successfully"));
});

const createManager = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, designation, campusId } = req.body;

  if (!name || !email || !phoneNumber || !designation || !campusId) {
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

  const managerData = await Manager.create({
    name,
    email,
    phoneNumber,
    designation,
    profile: profile.secure_url,
    campus: campusId,
    createdBy: req.admin._id,
  });

  if (!managerData) {
    throw new apiError(400, "Manager creation failed");
  }

  const createdManager = await Manager.findById(managerData._id)
    .populate({
      path: "campus",
      select: "name",
      populate: {
        path: "city",
        select: "name",
        populate: {
          path: "country",
          select: "name",
        },
      },
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    });

  if (!createdManager) {
    throw new apiError(400, "Manager creation failed");
  }

  res
    .status(201)
    .json(new apiResponse(201, createdManager, "Manager created successfully"));
});

const updateManagerDetails = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const { name, email, phoneNumber, designation, campusId } = req.body;

  if (!name || !email || !phoneNumber || !designation || !campusId) {
    throw new apiError(400, "All fields are required");
  }

  const updatedManager = await Manager.findByIdAndUpdate(
    managerId,
    {
      name,
      email,
      phoneNumber,
      designation,
      campus: campusId,
      updatedBy: req.admin._id,
    },
    { new: true }
  )
    .populate({
      path: "campus",
      select: "name",
      populate: {
        path: "city",
        select: "name",
        populate: {
          path: "country",
          select: "name",
        },
      },
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedManager) {
    throw new apiError(400, "Manager update failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedManager, "Manager updated successfully"));
});

const updateManagerPicture = asyncHandler(async (req, res) => {
  const { managerId } = req.params;

  const profilePath = req.file?.path;

  if (!profilePath) {
    throw new apiError(400, "Profile is required");
  }

  const profile = await uploadOnCloudinary(profilePath);

  if (!profile) {
    throw new apiError(400, "Profile upload failed");
  }

  const previousProfile = await Manager.findById(managerId);

  if (!previousProfile) {
    throw new apiError(400, "Manager not found");
  }

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  const updatedManager = await Manager.findByIdAndUpdate(
    managerId,
    {
      profile: profile.secure_url,
      updatedBy: req.admin._id,
    },
    { new: true }
  )
  .populate({
    path: "campus",
    select: "name",
    populate: {
      path: "city",
      select: "name",
      populate: {
        path: "country",
        select: "name",
      },
    },
  })
  .populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  })
  .populate({
    path: "updatedBy",
    select: "name email profile phoneNumber",
  });

  if (!updatedManager) {
    throw new apiError(400, "Profile update failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedManager, "Profile updated successfully"));
});

const deleteManager = asyncHandler(async (req, res) => {
  const { managerId } = req.params;

  const manager = await Manager.findById(managerId);

  if (!manager) {
    throw new apiError(400, "Manager not found");
  }

  if (manager?.profile) {
    await deleteFromCloudinary(manager?.profile);
  }

  const deletedManager = await Manager.findByIdAndDelete(managerId);

  if (!deletedManager) {
    throw new apiError(400, "Manager deletion failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, managerId, "Manager deleted successfully"));
});

export {
  getManagers,
  createManager,
  updateManagerPicture,
  updateManagerDetails,
  deleteManager,
};
