import express from "express";
import {
  getThumbnailbyId,
  getUserThumbnails,
} from "../controllers/UserController.js";
import protect from "../middlewares/Auth.js";

const userRouter = express.Router();

userRouter.get("/thumbnails", protect, getUserThumbnails);
userRouter.get("/thumbnail/:id",protect, getThumbnailbyId);

export default userRouter;
