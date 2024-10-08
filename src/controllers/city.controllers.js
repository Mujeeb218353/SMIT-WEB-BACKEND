import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { City } from "../models/city.model.js";

const getCities = asyncHandler(async (req, res) => {
  const cityData = await City.find()
    .populate({
      path: "country",
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

  if (!cityData) {
    throw new apiError(404, "Cities not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, cityData, "Cities fetched successfully"));
});

const createCity = asyncHandler(async (req, res) => {
  const { name, countryId } = req.body;

  if (!name || !countryId) {
    throw new apiError(400, "All fields are required");
  }

  const newCity = new City({
    name,
    country: countryId,
    createdBy: req.admin._id,
  });

  await newCity.save();

  const createdCity = await City.findById(newCity._id)
    .populate({
      path: "country",
      select: "name",
    })
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    });

  res
    .status(201)
    .json(new apiResponse(201, createdCity, "City created successfully"));
});

const updateCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const { name, countryId } = req.body;

  if (!name || !countryId) {
    throw new apiError(400, "All fields are required");
  }

  const updatedCity = await City.findByIdAndUpdate(
    cityId,
    {
      $set: {
        name,
        country: countryId,
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
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  res
    .status(200)
    .json(new apiResponse(200, updatedCity, "City updated successfully"));
});

const deleteCity = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  const deletedCity = await City.findByIdAndDelete(cityId);

  if (!deletedCity) {
    throw new apiError(404, "City not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, cityId, "City deleted successfully"));
});

export { getCities, createCity, updateCity, deleteCity };
