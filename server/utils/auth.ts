import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'mysecret';
const expiration = '2h';

export const signToken = (user: { _id: string; username: string; email: string }) => {
  return jwt.sign({ _id: user._id, username: user.username, email: user.email }, secret, { expiresIn: expiration });
};
