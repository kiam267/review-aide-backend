import express from 'express';
// import {
//   register,
//   login,
// } from '../controllers/auth-controller.js';
// import validation from '../validations/validation.js';
// import {
//   registerSchema,
//   loginSchema,
// } from '../schema/auth-schema.js';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new admin
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 10
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *                 description: Must contain at least one uppercase letter, one lowercase letter, one number, and one special character
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Bad request (e.g., email already exists, validation errors)
 *       500:
 *         description: Internal server error
 */

// validation(registerSchema), register
router.route('/register').get(function (req, res) {
  res.json({ message: 'Register endpoint is working' });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an admin or user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *                 description: Must contain at least one uppercase letter, one lowercase letter, one number, and one special character
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request (e.g., email already exists, validation errors)
 *       500:
 *         description: Internal server error
 */

// router.post('/login', validation(loginSchema), login);

export default router;
