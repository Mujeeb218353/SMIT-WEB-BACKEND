import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Campus } from "../models/campus.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getCampuses = asyncHandler(async (req, res) => {
  const campusData = await Campus.find()
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!campusData) {
    throw new apiError(404, "Campuses not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, campusData, "Campuses fetched successfully"));
});

const createCampus = asyncHandler(async (req, res) => {
  const {
    name,
    countryId,
    cityId,
    location,
    address,
    timings,
    contact,
    mapLocation,
  } = req.body;

  if (
    !name ||
    !countryId ||
    !cityId ||
    !location ||
    !address ||
    !timings ||
    !contact ||
    !mapLocation
  ) {
    throw new apiError(400, "All fields are required");
  }

  const imagesLocalPath = req.files?.images?.[0]?.path;

  if (!imagesLocalPath) {
    throw new apiError(400, "Images are required");
  }

  const images = await Promise.all(
    req.files.images.map(async (image) => {
      const imageUpload = await uploadOnCloudinary(image.path);
      if (!imageUpload) {
        throw new apiError(400, "Image upload failed");
      }
      return imageUpload.secure_url;
    })
  );

  const newCampus = new Campus({
    name,
    images,
    country: countryId,
    city: cityId,
    location,
    address,
    mapLocation,
    contact,
    timings,
    createdBy: req.admin._id,
  });

  await newCampus.save();

  if (!newCampus) {
    throw new apiError(400, "Campus creation failed");
  }

  const createdCampus = await Campus.findById(newCampus._id)
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  res
    .status(201)
    .json(new apiResponse(201, createdCampus, "Campus created successfully"));
});

const updateCampusDetails = asyncHandler(async (req, res) => {
  const { campusId } = req.params;

  const {
    name,
    countryId,
    cityId,
    location,
    address,
    timings,
    contact,
    mapLocation,
  } = req.body;

  if (
    !name ||
    !countryId ||
    !cityId ||
    !location ||
    !address ||
    !timings ||
    !contact ||
    !mapLocation
  ) {
    throw new apiError(400, "All fields are required");
  }

  const updatedCampus = await Campus.findByIdAndUpdate(
    campusId,
    {
      $set: {
        name,
        country: countryId,
        city: cityId,
        location,
        address,
        mapLocation,
        contact,
        timings,
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedCampus) {
    throw new apiError(400, "Campus update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, updatedCampus, "Campus Details updated successfully")
    );
});

const updateCampusPicture = asyncHandler(async (req, res) => {
  const { campusId } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new apiError(400, "Image is required");
  }

  const campus = await Campus.findById(campusId);

  if (!campus) {
    throw new apiError(400, "Campus not found");
  }

  if (campus.images.includes(imageUrl)) {
    await deleteFromCloudinary(imageUrl);
  }

  campus.images.includes(imageUrl)
    ? campus.images.splice(campus.images.indexOf(imageUrl), 1)
    : null;

  const imagePath = req.file?.path;

  if (!imagePath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imagePath);

  campus.images.push(image.secure_url);

  await campus.save();

  const updatedCampus = await Campus.findById(campusId)
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
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
      new apiResponse(200, updatedCampus, "Campus image updated successfully")
    );
});

const addCampusPicture = asyncHandler(async (req, res) => {
  const { campusId } = req.params;

  const campus = await Campus.findById(campusId);

  if (!campus) {
    throw new apiError(400, "Campus not found");
  }

  const imagePath = req.file?.path;

  if (!imagePath) {
    throw new apiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imagePath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  campus.images.push(image.secure_url);

  await campus.save();

  const updatedCampus = await Campus.findById(campusId)
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
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
      new apiResponse(200, updatedCampus, "Campus image added successfully")
    );
});

const deleteCampusPicture = asyncHandler(async (req, res) => {
  const { campusId } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new apiError(400, "Image Url is required");
  }

  const campus = await Campus.findById(campusId);

  if (!campus) {
    throw new apiError(400, "Campus not found");
  }

  if (!campus.images.includes(imageUrl)) {
    throw new apiError(400, "Image not found");
  }

  await deleteFromCloudinary(imageUrl);

  campus.images.splice(campus.images.indexOf(imageUrl), 1);

  await campus.save();

  const updatedCampus = await Campus.findById(campusId)
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "city",
      select: "name",
    })
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
      new apiResponse(200, updatedCampus, "Campus image deleted successfully")
    );
});

const deleteCampus = asyncHandler(async (req, res) => {
  const { campusId } = req.params;

  const campus = await Campus.findById(campusId);

  if (!campus) {
    throw new apiError(400, "Campus not found");
  }

  if (campus.images.length > 0) {
    for (let i = 0; i < campus.images.length; i++) {
      await deleteFromCloudinary(campus.images[i])
    }
  }
  
  const deletedCampus = await Campus.findByIdAndDelete(campusId)

  if(!deletedCampus){
    throw new apiError(400, "Campus deletion failed");
  }

  res.status(200).json(new apiResponse(200, campusId, "Campus deleted successfully"))
});

export {
  getCampuses,
  createCampus,
  updateCampusDetails,
  updateCampusPicture,
  addCampusPicture,
  deleteCampusPicture,
  deleteCampus,
};
