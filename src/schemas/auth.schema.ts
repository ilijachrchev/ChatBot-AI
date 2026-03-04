import { z } from 'zod'

export const UserRegistrationSchema = z.object({
  fullname: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(60, { message: 'Full name must be less than 60 characters' })
    .refine(
      (value) => /^[a-zA-Z\s'-]+$/.test(value),
      'Full name can only contain letters, spaces, hyphens and apostrophes'
    ),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  confirmEmail: z.string().email({ message: 'Please enter a valid email' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password cannot exceed 64 characters' })
    .refine(
      (value) => /^[a-zA-Z0-9_.\-!@#$%^&*]*$/.test(value ?? ''),
      'Password contains invalid characters'
    ),
  confirmPassword: z.string(),
  otp: z.string().min(6, { message: 'Please enter the 6 digit code' }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
.refine((data) => data.email === data.confirmEmail, {
  message: 'Email addresses do not match',
  path: ['confirmEmail'],
})

export type UserRegistrationProps = z.infer<typeof UserRegistrationSchema>

export const UserLoginSchema = z.object({
  email: z.string().email({ message: 'You did not enter a valid email' }),
  password: z
    .string()
    .min(8, { message: 'Your password must be atleast 8 characters long' })
    .max(64, {
      message: 'Your password can not be longer then 64 characters long',
    }),
    keepMeLoggedIn: z.boolean().default(false),
})

export type UserLoginProps = z.infer<typeof UserLoginSchema>

export const ChangePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Your password must be atleast 8 characters long' })
    .max(64, {
      message: 'Your password can not be longer then 64 characters long',
    })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
      'password should contain only alphabets and numbers'
    ),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword'],
})

export type ChangePasswordProps = z.infer<typeof ChangePasswordSchema>
