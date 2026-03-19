import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const generateToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};