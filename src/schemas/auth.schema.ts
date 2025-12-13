import { z } from 'zod'

export const UserRegistrationSchema = z.object({
  type: z.string().min(1),
  fullname: z
    .string()
    .min(4, { message: 'your full name must be atleast 4 characters long' }),
  email: z.string().email({ message: 'Incorrect email format' }),
  confirmEmail: z.string().email({ message: 'Incorrect email format' }),
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
  otp: z.string().min(6, { message: 'You must enter a 6 digit code' }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword'],
})
.refine((data) => data.email === data.confirmEmail, {
  message: 'Your emails do not match',
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
