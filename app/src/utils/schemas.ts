import * as yup from 'yup';
import { role } from '../models/auth';

export const passwordSchema = yup
  .string()
  .required('Password is required.')
  .min(8, 'Password must be at least 8 characters long.')
  .matches(/\d/, 'Password must contain at least one digit.')
  .matches(/[A-Z]/, 'Password must contain at least one upper case character.');

export const emailSchema = yup
  .string()
  .required('Email is required.')
  .email('Please enter a valid email.');

export const roleSchema = yup
  .string()
  .required('Please specify a role.')
  .oneOf(Object.values(role), 'Role is not allowed.');
