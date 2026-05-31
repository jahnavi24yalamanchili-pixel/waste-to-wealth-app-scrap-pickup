import { Schema, model } from "mongoose";

const pickupItemSchema = new Schema(
  {
    material: {
      type: Schema.Types.ObjectId,
      ref: "material",
      required: [true, "Material is required"],
    },
    estimatedWeightKg: {
      type: Number,
      required: [true, "Estimated weight is required"],
      min: 0.1,
    },
  },
  { _id: false }
);

const pickupSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Customer is required"],
    },
    assignedCollector: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    rejectedCollectors: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Pickup date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    items: {
      type: [pickupItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one scrap item is required",
      },
    },
    estimatedAmount: {
      type: Number,
      default: 0,
    },
    greenPoints: {
      type: Number,
      default: 0,
    },
    greenPointsAwarded: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "accepted", "rejected", "out-for-pickup", "picked", "cancelled"],
      default: "scheduled",
    },
    collectorNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//create pickup model
export const PickupModel = model("pickup", pickupSchema);
