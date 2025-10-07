import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(3, {
      message: 'Name must be at least 3 characters',
    })
    .max(255, {
      message: 'Name must be at most 255 characters',
    }),

  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' })
    .min(10, {
      message: 'Email must be at least 10 characters',
    }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, {
      message: 'Password must be at least 10 characters',
    })
    .regex(passwordRegex, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, {
      message: 'Password must be at least 10 characters',
    })
    .regex(passwordRegex, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

export { registerSchema, loginSchema };
