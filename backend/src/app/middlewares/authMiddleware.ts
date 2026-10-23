import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../modules/auth/auth.model";
import { userInterface } from "./userInterface";
import { appError } from "../errors/appError";

export const auth = (...requiredRoles: string[]) => {
  return async (req: userInterface, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(
          new appError("Authentication required. No token provided", 401),
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new appError("User not found", 401));
      }

      req.user = user;

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return next(
          new appError(
            "You do not have permission to perform this action",
            403,
          ),
        );
      }

      next();
    } catch (error) {
      next(new appError("Invalid or expired token", 401));
    }
  };
};

export const optionalAuth = () => {
  return async (req: userInterface, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        req.user = undefined;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user;
      }

      next();
    } catch (error) {
      req.user = undefined;
      next();
    }
  };
};
