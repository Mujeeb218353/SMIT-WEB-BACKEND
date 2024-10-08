import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";

const aboutUsSchema = new mongoose.Schema(
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

aboutUsSchema.pre("save", async function (next) {
  const count = await mongoose.model("About Us").countDocuments();
  if (count >= 1) {
    return next(new apiError(400, "You can save only one Post"));
  }
  next();
});

export const AboutUs = mongoose.model("About Us", aboutUsSchema);