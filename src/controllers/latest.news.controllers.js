import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { LatestNews } from "../models/latest.news.model.js";

const getLatestNews = asyncHandler(async (req, res) => {
  const latestNewsData = await LatestNews.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!latestNewsData) {
    throw new apiError(404, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, latestNewsData, "Data fetched successfully"));
});

const createLatestNews = asyncHandler(async (req, res) => {
  const { title, description, link } = req.body;

  if (!title || !description || !link) {
    throw new apiError(400, "All fields are required");
  }

  const newLatestNews = new LatestNews({
    title,
    description,
    link,
    createdBy: req.admin._id,
  });

  if (!newLatestNews) {
    throw new apiError(400, "Data not found");
  }

  await newLatestNews.save();

  const createdLatestNews = await LatestNews.findById(newLatestNews._id).populate(
    {
      path: "createdBy",
      select: "name email profile phoneNumber",
    }
  );

  res
    .status(201)
    .json(new apiResponse(201, createdLatestNews, "Latest News created"));
});

const updateLatestNews = asyncHandler(async (req, res) => {
  const { latestNewsId } = req.params;
  const { title, description, link } = req.body;

  if (!title || !description || !link) {
    throw new apiError(400, "All fields are required");
  }

  if (!latestNewsId) {
    throw new apiError(400, "Data not found");
  }

  const updatedLatestNews = await LatestNews.findByIdAndUpdate(latestNewsId, {
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

  if (!updatedLatestNews) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(201)
    .json(new apiResponse(201, updatedLatestNews, "Latest News updated successfully")); 
});

const deleteLatestNews = asyncHandler(async (req, res) => {
  const { latestNewsId } = req.params;

  if (!latestNewsId) {
    throw new apiError(400, "Data not found");
  }

  const deletedLatestNews = await LatestNews.findByIdAndDelete(latestNewsId);

  if (!deletedLatestNews) {
    throw new apiError(400, "Data not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, latestNewsId, "Latest News deleted successfully"));
});

export { getLatestNews, createLatestNews, updateLatestNews, deleteLatestNews };
