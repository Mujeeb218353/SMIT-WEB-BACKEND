import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Course } from "../models/course.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getCourses = asyncHandler(async (req, res) => {
  const courseData = await Course.find()
    .populate({
      path: "countries",
      select: "name",
    })
    .populate({
      path: "cities",
      select: "name",
    })
    .populate({
      path: "campuses",
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

  if (!courseData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, courseData, "Data fetched successfully"));
});

const createCourse = asyncHandler(async (req, res) => {
  const { name, category, duration, description, outline, countryIds, cityIds, campusIds } = req.body;

  console.log(name, category, duration, description, outline, countryIds, cityIds, campusIds);

  if (!name || !category || !duration || !description || !outline || !countryIds || !cityIds || !campusIds) {
    throw new apiError(400, "All fields are required");
  }

  const imagesLocalPath = req.file?.path;

  if (!imagesLocalPath) {
    throw new apiError(400, "Images are required");
  }

  const image = await uploadOnCloudinary(imagesLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const newCourse = new Course({
    name,
    category,
    duration,
    description,  
    outline,
    image: image.secure_url,
    countries: countryIds,
    cities: cityIds,
    campuses: campusIds,
    createdBy: req.admin._id,
  });

  await newCourse.save();

  const createdCourse = await Course.findById(newCourse._id)
    .populate({
      path: "countries",
      select: "name",
    })
    .populate({
      path: "cities",
      select: "name",
    })
    .populate({
      path: "campuses",
      select: "name"
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  res.status(201).json(new apiResponse(201, createdCourse, "Course created successfully"));    
});

const updateCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, category, duration, description, outline, countryIds, cityIds, campusIds } = req.body;
  console.log(name, category, duration, description, outline, countryIds, cityIds, campusIds);
  

  if (!name || !category || !duration || !description || !outline || !countryIds || !cityIds || !campusIds) {
    throw new apiError(400, "All fields are required");
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        name,
        category,
        duration,
        description,
        outline,
        countries: countryIds,
        cities: cityIds,
        campuses: campusIds,
        updatedBy: req.admin._id,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "countries",
      select: "name",
    })
    .populate({
      path: "cities",
      select: "name",
    })
    .populate({
      path: "campuses",
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

  if (!updatedCourse) {
    throw new apiError(404, "Course not found");
  }

  res.status(200).json(new apiResponse(200, updatedCourse, "Course updated successfully"));
});

const updateCoursePicture = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const imagesLocalPath = req.file?.path;

  if (!imagesLocalPath) {
    throw new apiError(400, "Images are required");
  }

  const image = await uploadOnCloudinary(imagesLocalPath);

  if (!image) {
    throw new apiError(400, "Image upload failed");
  }

  const previousImage = await Course.findById(courseId);

  if (!previousImage) {
    throw new apiError(404, "Course not found");
  }

  if (previousImage?.image) {
    await deleteFromCloudinary(previousImage?.image);
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
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
      path: "countries",
      select: "name",
    })
    .populate({
      path: "cities",
      select: "name",
    })
    .populate({
      path: "campuses",
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

  if (!updatedCourse) {
    throw new apiError(404, "Course not found");
  }

  res.status(200).json(new apiResponse(200, updatedCourse, "Course updated successfully"));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new apiError(404, "Course not found");
  }

  if (course?.image) {
    await deleteFromCloudinary(course?.image);
  }

  const deletedCourse = await Course.findByIdAndDelete(courseId);

  if (!deletedCourse) {
    throw new apiError(404, "Course not found");
  }

  res.status(200).json(new apiResponse(200, courseId, "Course deleted successfully"));
});

export {
  getCourses,
  createCourse,
  updateCourseDetails,
  updateCoursePicture,
  deleteCourse,
}