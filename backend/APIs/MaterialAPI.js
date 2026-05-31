import exp from "express";
import { MaterialModel } from "../models/MaterialModel.js";
import { seedMaterials } from "../data/seedMaterials.js";

export const materialRouter = exp.Router();

//get all material prices
materialRouter.get("/materials", async (req, res, next) => {
  try {
    let materials = await MaterialModel.find().sort({ category: 1, name: 1 });

    if (materials.length === 0) {
      materials = await MaterialModel.insertMany(seedMaterials);
    }

    res.status(200).json({ message: "materials", payload: materials });
  } catch (err) {
    next(err);
  }
});

//add material price
materialRouter.post("/material", async (req, res, next) => {
  try {
    const material = await MaterialModel.create(req.body);
    res.status(201).json({ message: "material created", payload: material });
  } catch (err) {
    next(err);
  }
});
