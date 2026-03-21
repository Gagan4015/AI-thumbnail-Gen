import express from "express";
import {
  deleteThumbnail,
  generateThumbnail,
} from "../controllers/ThumbnailController.js";
import protect from "../middlewares/Auth.js";

const thumbnailRouter = express.Router();

thumbnailRouter.post("/generate", protect, generateThumbnail);
thumbnailRouter.delete("/delete/:id", protect, deleteThumbnail);

export default thumbnailRouter;
