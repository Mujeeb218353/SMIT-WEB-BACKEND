import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Admin } from "../models/admin.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, error?.message || "Internal server error");
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, username, email, password, phoneNumber } = req.body;

  if (
    [name, username, email, password, phoneNumber].some(
      (field) => String(field).trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ username, email });

  if (existedAdmin) {
    throw new apiError(409, "User already exists");
  }

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  console.log(profile);

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const newAdmin = await Admin.create({
    name,
    username,
    email,
    password,
    phoneNumber,
    profile: profile.secure_url,
    createdBy: req.admin._id,
  });

  // console.log(newAdmin);

  const createdAdmin = await Admin.findById(newAdmin._id)
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .select("-password")
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    });

  console.log(createdAdmin);

  if (!createdAdmin) {
    const deleted = await deleteFromCloudinary(profile);
    console.log(deleted);
    throw new apiError(500, "Something went wrong while creating user");
  }

  res
    .status(201)
    .json(new apiResponse(201, createdAdmin, "User created successfully"));

  await newAdmin.save();
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new apiError(400, "Email is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const admin = await Admin.findOne({
    username,
  });

  if (!admin) {
    throw new apiError(400, "User not found");
  }

  const isPasswordCorrect = await admin.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "username or password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id
  );

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!loggedInAdmin) {
    throw new apiError(500, "Something went wrong while logging in");
  }

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new apiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // console.log(incomingRefreshToken);

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?._id);

    if (!admin) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== admin?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      admin._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new apiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid access token");
  }
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const previousProfile = await Admin.findById(req.admin._id).select("profile");

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
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

  if (!updatedAdmin) {
    throw new apiError(500, "Something went wrong while updating profile");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedAdmin, "Profile updated successfully"));
});

const updateAdminDetails = asyncHandler(async (req, res) => {
  const { name, username, email, phoneNumber } = req.body;

  console.log(name, username, email, phoneNumber);

  if (
    [name, username, email, phoneNumber].some(
      (field) => String(field).trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ username, email });

  if (existedAdmin) {
    throw new apiError(409, "User already exists");
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        name,
        username,
        email,
        phoneNumber,
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

  // console.log(updatedAdmin);

  if (!updatedAdmin) {
    throw new apiError(500, "Something went wrong while updating profile");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedAdmin, "Details updated successfully"));
});

const inActiveAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    {
      $set: {
        status: "inactive",
        deletedBy: req.admin._id,
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
  )
    .select("-password -refreshToken")
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedAdmin) {
    throw new apiError(500, "Something went wrong while deleting admin");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedAdmin, "Admin inactivated successfully"));
});

const activeAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    {
      $set: {
        status: "active",
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
  )
    .select("-password -refreshToken")
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedAdmin) {
    throw new apiError(500, "Something went wrong while deleting admin");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedAdmin, "Admin activated successfully"));
});

const updateAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.params;

  if (!newPassword) {
    throw new apiError(400, "Email is required");
  }

  const admin = await Admin.findOne({ email: req.admin.email });

  if (!admin) {
    throw new apiError(400, "User not found");
  }

  admin.password = newPassword;
  admin.updatedBy = req.admin._id;
  await admin.save();

  res
    .status(200)
    .json(new apiResponse(200, null, "Password updated successfully"));
});

const adminVerificationStatus = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { verified } = req.body;

  if (verified === undefined) {
    throw new apiError(400, "verification status is required");
  }

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      $set: {
        verified,
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

  if (!admin) {
    throw new apiError(400, "User not found");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        null,
        "Admin verification status updated successfully"
      )
    );
});

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find()
    .select("-password -refreshToken")
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!admins) {
    throw new apiError(500, "Something went wrong while fetching admins");
  }

  res
    .status(200)
    .json(new apiResponse(200, admins, "Admins fetched successfully"));
});

const forgotPassword = asyncHandler(async () => {});

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  updateAdminProfile,
  updateAdminDetails,
  inActiveAdmin,
  activeAdmin,
  updateAdminPassword,
  forgotPassword,
  adminVerificationStatus,
  getAdmins,
};
