// controllers/auth-controller.js
// import { PrismaClient } from '@prisma/client';
// import {
//   errorMessage,
//   successMessage,
// } from '../utils/message.js';
// import {
//   password_hash,
//   token_generator,
//   comparePassword,
// } from '../utils/utils.js';

// const prisma = new PrismaClient();

// Register
export const register = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  // const existing = await prisma.user.findUnique({
  //   where: { email },
  // });
  // if (existing) {
  //   return errorMessage(res, 400, 'Email already exists');
  // }

  res.json({
    msg: 'Register work ',
    data: {
      neme,
      email,
      password,
      isAdmin,
    },
  });
  // const hashPassword = await password_hash(password);

  // const newAdmin = await prisma.user.create({
  //   data: {
  //     name,
  //     email,
  //     password: hashPassword,
  //     isAdmin: Boolean(isAdmin),
  //   },
  // });
  // const response = {
  //   isAdmin: newAdmin.isAdmin,
  //   email: newAdmin.email,
  // };
  // return successMessage(
  //   res,
  //   200,
  //   'Register successfully',
  //   response
  // );
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  // const admin = await prisma.user.findUnique({
  //   where: { email },
  // });

  // if (!admin) {
  //   return errorMessage(res, 400, 'Email does not exist');
  // }
  res.json({
    msg: 'Login worked',
    data: {
      email,
      password,
    },
  });
  // const validPassword = await comparePassword(
  //   password,
  //   admin.password
  // );
  // if (!validPassword) {
  //   return errorMessage(
  //     res,
  //     400,
  //     'Password mismatch. Please check your password.'
  //   );
  // }

  // const token = token_generator({
  //   username: admin.username,
  //   email: admin.email,
  //   isAdmin: admin.isAdmin,
  // });

  // const response = {
  //   token,
  //   isAdmin: admin.isAdmin,
  //   email: admin.email,
  // };
  // return successMessage(
  //   res,
  //   200,
  //   'Login successful',
  //   response
  // );
};

// Get all users (example)
// export const getAll = async (req, res) => {
//   console.log('ok');
//   const { token } = req.headers;
//   const tokenVerify = verifyToken(token);
//   console.log(req.headers, 'pok');

//   try {
//     const users = await prisma.user.findMany();
//     res.json({ msg: 'Everything ok!', users });
//   } catch (err) {
//     res.json(
//       errorMessage('error', 'Could not fetch users')
//     );
//   }
// };

// Edit user
// export const editUser = async (req, res) => {
//   const token = req.headers.token;
//   const {
//     username,
//     phone,
//     email,
//     company_name,
//     facebook_link,
//     google_link,
//     temporaray_lock,
//     userEmail,
//   } = req.body;

//   try {
//     const isVerified = verifyToken(token);
//     if (!Boolean(isVerified.decoded.isAdmin)) {
//       return res.json(
//         errorMessage(
//           'error',
//           'You are not allowed to edit this user'
//         )
//       );
//     }

//     const updatedUser = await prisma.user.update({
//       where: { email: userEmail },
//       data: {
//         username,
//         phone,
//         email,
//         company_name,
//         facebook_link,
//         google_link,
//         temporaray_lock,
//       },
//     });

//     const users = await prisma.user.findMany();

//     return res.json(
//       errorMessage('success', 'Update successful', users)
//     );
//   } catch (error) {
//     console.error(error);
//     return res.json(
//       errorMessage('error', 'Data not updated')
//     );
//   }
// };

// Delete user
// export const userDelete = async (req, res) => {
//   const { email } = req.body;
//   const token = req.headers.token;

//   try {
//     const isVerified = verifyToken(token);
//     if (!Boolean(isVerified.decoded.isAdmin)) {
//       return res.json(
//         errorMessage(
//           'error',
//           'You are not allowed to delete this user'
//         )
//       );
//     }

//     // Delete related client visitor data first
//     await prisma.clientVisitor.deleteMany({
//       where: { user_email: email },
//     });

//     // Delete the user
//     await prisma.user.delete({ where: { email } });

//     const users = await prisma.user.findMany();
//     return res.json(
//       errorMessage('success', 'User deleted', users)
//     );
//   } catch (error) {
//     console.error(error);
//     return res.json(
//       errorMessage('error', 'Data not deleted')
//     );
//   }
// };
