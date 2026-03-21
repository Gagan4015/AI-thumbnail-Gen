import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
} from "../controllers/AuthController.js";
import protect from "../middlewares/Auth.js";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", registerUser);
AuthRoutes.post("/login", loginUser);
AuthRoutes.get("/verify", protect, verifyUser);
AuthRoutes.post("/logout", protect, logoutUser);

export default AuthRoutes
