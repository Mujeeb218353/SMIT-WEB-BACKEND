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