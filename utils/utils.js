// utils/utils.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import axios from 'axios';

export const password_hash = async password => {
  const saltRound = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(
    password,
    saltRound
  );
  return hash_password;
};

export const comparePassword = async (
  password,
  hash_password
) => {
  return await bcrypt.compare(password, hash_password);
};

export const token_generator = token => {
  return jwt.sign(token, process.env.VERIFY_SIGNATURE, {
    expiresIn: '2h',
  });
};

// Function to verify a JWT token
export const verifyToken = token => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.VERIFY_SIGNATURE
    );

    // Check if the token is expired
    if (decoded.exp < Date.now() / 1000) {
      return { valid: false, message: 'Token has expired' };
    }

    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: 'Invalid token' };
  }
};
