import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { StaffMember } from "../models/staff.member.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getStaffMembers = asyncHandler(async (req, res) => {
  const staffMembersData = await StaffMember.find()
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

  if (!staffMembersData) {
    throw new apiError(404, "Staff Members not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        staffMembersData,
        "Staff Members fetched successfully"
      )
    );
});

const createStaffMember = asyncHandler(async (req, res) => {
  const { name, designation, campusId } = req.body;

  if (!name || !designation || !campusId) {
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

  const staffMemberData = await StaffMember.create({
    name,
    designation,
    profile: profile.secure_url,
    campus: campusId,
    createdBy: req.admin._id,
  });

  if (!staffMemberData) {
    throw new apiError(400, "Staff Member creation failed");
  }

  const createdStaffMember = await StaffMember.findById(staffMemberData._id)
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

  if (!createdStaffMember) {
    throw new apiError(400, "Manager creation failed");
  }

  res
    .status(201)
    .json(
      new apiResponse(
        201,
        createdStaffMember,
        "Staff Member created successfully"
      )
    );
});

const updateStaffMemberPicture = asyncHandler(async (req, res) => {
  const { staffMemberId } = req.params;

  const profilePath = req.file?.path;

  if (!profilePath) {
    throw new apiError(400, "Profile is required");
  }

  const profile = await uploadOnCloudinary(profilePath);

  if (!profile) {
    throw new apiError(400, "Profile upload failed");
  }

  const previousProfile = await StaffMember.findById(staffMemberId);

  if (!previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile.profile);
  }

  const updatedProfile = await StaffMember.findByIdAndUpdate(staffMemberId, {
    $set: {
      profile: profile.secure_url,
      updatedBy: req.admin._id,
    },
  })
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

  if (!updatedProfile) {
    throw new apiError(400, "Profile update failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedProfile, "Profile updated successfully"));
});

const updateStaffMemberDetails = asyncHandler(async (req, res) => {
  const { staffMemberId } = req.params;
  const { name, designation, campusId } = req.body;

  if (!name || !designation || !campusId) {
    throw new apiError(400, "All fields are required");
  }

  const updatedStaffMember = await StaffMember.findByIdAndUpdate(
    staffMemberId,
    {
      $set: {
        name,
        designation,
        campus: campusId,
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
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

  if (!updatedStaffMember) {
    throw new apiError(400, "Staff Member update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedStaffMember,
        "Staff Member updated successfully"
      )
    );
});

const deleteStaffMember = asyncHandler(async (req, res) => {
  const { staffMemberId } = req.params;

  const staffMember = await StaffMember.findById(staffMemberId);

  if (!staffMember) {
    throw new apiError(400, "Staff Member not found");
  }

  if (staffMember?.profile) {
    await deleteFromCloudinary(staffMember.profile);
  }

  const deletedStaffMember = await StaffMember.findByIdAndDelete(staffMemberId);

  if (!deletedStaffMember) {
    throw new apiError(400, "Staff Member deletion failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, staffMemberId, "Staff Member deleted successfully")
    );
});

export {
  getStaffMembers,
  createStaffMember,
  updateStaffMemberPicture,
  updateStaffMemberDetails,
  deleteStaffMember,
};
