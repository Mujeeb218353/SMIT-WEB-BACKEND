import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export const Instructor = mongoose.model("Instructor", instructorSchema);
