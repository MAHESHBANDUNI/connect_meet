import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "../drizzle/index.js";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "../utils/errorHandler.js";

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Not authorized, no token");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    const user = await db.query.users.findFirst({
      where: eq(users.userId, decoded.userId)
    });

    if (!user) {
      throw new UnauthorizedError(
        "User belonging to this token no longer exists"
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(
      error instanceof Error
        ? error
        : new UnauthorizedError(
            "Your session has expired. Please sign in again."
          )
    );
  }
};
