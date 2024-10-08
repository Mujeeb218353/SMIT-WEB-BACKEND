import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
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
    experience: {
      type: String,
      required: true,
    },
    portfolio: {
      type: String,
      required: true,
    },
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      }
    ],
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
