import { Request, Response } from "express";
import userModel from "../models/User.js";
import bcrypt from "bcrypt";

// Controller for user Registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // find user by email
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashPass,
    });
    await newUser.save();

    // setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id.toString();

    return res.json({
      message: "Account created Successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controller for user Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or Password" });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or Password" });
    }

    // setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    return res.json({
      message: "Login Successfull",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// controllers for user Logout

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error: any) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  return res.json({ message: "Logout successful" });
};

// Controllers For User Verify
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "Invalid User" });
    }
    return res.json({ user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
