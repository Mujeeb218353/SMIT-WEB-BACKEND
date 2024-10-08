import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Country } from "../models/country.model.js";

const getCountries = asyncHandler(async (req, res) => {
  const countryData = await Country.find()
    .populate({
      path: "createdBy",
      select: "name email profile phoneNumber",
    })
    .populate({
      path: "updatedBy",
      select: "name email profile phoneNumber",
    });

  if (!countryData) {
    throw new apiError(404, "Countries not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, countryData, "Countries fetched successfully"));
});

const createCountries = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new apiError(400, "Country name is required");
  }

  const newCountry = new Country({
    name,
    createdBy: req.admin._id,
  });

  await newCountry.save();

  const createdCountry = await Country.findById(newCountry._id).populate({
    path: "createdBy",
    select: "name email profile phoneNumber",
  });

  res
    .status(201)
    .json(new apiResponse(201, createdCountry, "Country created successfully"));
});

const updateCountries = asyncHandler(async (req, res) => {
  const { countryId } = req.params;

  const { name } = req.body;

  if (!name) {
    throw new apiError(400, "Country name is required");
  }

  const updatedCountry = await Country.findByIdAndUpdate(
    countryId,
    {
      $set: {
        name,
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

  if (!updatedCountry) {
    throw new apiError(404, "Country not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedCountry, "Country updated successfully"));
});

const deleteCountries = asyncHandler(async (req, res) => {
  const { countryId } = req.params;

  const deletedCountry = await Country.findByIdAndDelete(countryId);

  if (!deletedCountry) {
    throw new apiError(404, "Country not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, countryId, "Country deleted successfully"));
});

export { 
    getCountries, 
    createCountries, 
    updateCountries, 
    deleteCountries 
};
