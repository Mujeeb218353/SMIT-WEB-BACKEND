import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
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
    outline: [
      {
        type: String,
        required: true,
      },
    ],
    countries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
      },
    ],
    cities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true,
      },
    ],
    campuses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
        required: true,
      },
    ],
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

export const Course = mongoose.model("Course", courseSchema);
