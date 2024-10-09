import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { PastNews } from "../models/past.news.model.js";

const getPastNews = asyncHandler(async (req, res) => {
  const pastNewsData = await PastNews.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!pastNewsData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, pastNewsData, "Data fetched successfully"));
});

const createPastNews = asyncHandler(async (req, res) => {
  const { title, description, link } = req.body;

  if (!title || !description || !link) {
    throw new apiError(400, "All fields are required");
  }

  const newPastNews = new PastNews({
    title,
    description,
    link,
    createdBy: req.admin._id,
  });

  if (!newPastNews) {
    throw new apiError(400, "Data not found");
  }

  await newPastNews.save();

  const createdPastNews = await PastNews.findById(newPastNews._id).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  res
    .status(201)
    .json(new apiResponse(201, createdPastNews, "Past News created"));
});

const updatePastNews = asyncHandler(async (req, res) => {
  const { pastNewsId } = req.params;
  const { title, description, link } = req.body;

  if (!title || !description || !link) {
    throw new apiError(400, "All fields are required");
  }

  if (!pastNewsId) {
    throw new apiError(400, "Data not found");
  }

  const updatedPastNews = await PastNews.findByIdAndUpdate(pastNewsId, {
    title,
    description,
    link,
    updatedBy: req.admin._id,
  })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!updatedPastNews) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(201)
    .json(new apiResponse(201, updatedPastNews, "Past News updated successfully"));
});

const deletePastNews = asyncHandler(async (req, res) => {
  const { pastNewsId } = req.params;

  if (!pastNewsId) {
    throw new apiError(400, "Data not found");
  }

  const deletedPastNews = await PastNews.findByIdAndDelete(pastNewsId);

  if (!deletedPastNews) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, pastNewsId, "Past News deleted successfully"));
});

export { getPastNews, createPastNews, updatePastNews, deletePastNews };
