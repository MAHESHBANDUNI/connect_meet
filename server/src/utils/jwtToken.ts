import jwt, { Secret, SignOptions } from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

const tokenGeneration = async (user: any): Promise<string> => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      roleId: user.roleId,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

export default tokenGeneration;
