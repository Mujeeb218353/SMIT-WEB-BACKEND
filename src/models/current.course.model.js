import mongoose from "mongoose";

const currentCourseSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    },
    {
        timestamps: true
    }
);

export const CurrentCourse = mongoose.model("Current Course", currentCourseSchema)