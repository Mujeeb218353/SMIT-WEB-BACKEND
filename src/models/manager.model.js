import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
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

export const Manager = mongoose.model("Manager", managerSchema);
