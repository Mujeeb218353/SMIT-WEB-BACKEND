import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";

const chairmanMessageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

chairmanMessageSchema.pre("save", async function (next) {
  const count = await mongoose.model("Chairman Message").countDocuments();
  if (count >= 1) {
    return next(new apiError(400, "You can save only one Post"));
  }
  next();
});

export const ChairmanMessage = mongoose.model("Chairman Message", chairmanMessageSchema);