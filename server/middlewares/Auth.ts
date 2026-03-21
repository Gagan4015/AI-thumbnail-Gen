import { Request, Response, NextFunction } from "express";

// Middleware to check if user is exist

const protect = async (req: Request, res: Response, next: NextFunction) => {
  const { isLoggedIn, userId } = req.session;

  if (!isLoggedIn || !userId) {
    res.status(401).json({ message: "You are not Loggedin" });
  }

  next();
};
export default protect;
