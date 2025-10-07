import { authErrorMessage } from '../utils/error.js';
import { verifyToken } from '../utils/utils.js';

export const isCheckUser = (req, res, next) => {
  const token = req.headers.token;
  const isVerified = verifyToken(token);
  console.log(isVerified, req.headers.token);

  if (!isVerified.valid) {
    return res.json(authErrorMessage('auth', ''));
  }

  next();
};
