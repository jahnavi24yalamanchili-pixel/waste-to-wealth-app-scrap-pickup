import { Schema, model } from "mongoose";

const materialSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    pricePerKg: {
      type: Number,
      required: [true, "Price per kg is required"],
      min: 0,
    },
    greenPointsPerKg: {
      type: Number,
      required: [true, "Green points are required"],
      min: 0,
    },
    unit: {
      type: String,
      default: "kg",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//create material model
export const MaterialModel = model("material", materialSchema);
