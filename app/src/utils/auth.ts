import * as yup from 'yup';
import {
  NewUsersPermissionsUser,
  UsersPermissionsRole,
  UsersPermissionsUser,
} from '../generated/api';
import { role, RoleLabel, RoleValue } from '../models/auth';
import { emailSchema, passwordSchema, roleSchema } from './schemas';

export interface RegisterValues extends NewUsersPermissionsUser {
  repeatPassword: string;
}

export const isRole = (value: string): value is RoleValue => {
  return Object.values(role).includes(value as RoleValue);
};
export const userRoleToRoleValue = (
  userRole?: UsersPermissionsRole,
): RoleValue => {
  return userRole && 'id' in userRole
    ? (userRole.name as RoleValue)
    : role.Authenticated;
};
export const getCanCrudTrips = (user: UsersPermissionsUser): boolean => {
  const roleValue =
    user.role &&
    userRoleToRoleValue(user.role as UsersPermissionsRole | undefined);

  return roleValue === role.Admin || roleValue === role.Manager;
};

export const getCanCrudUsers = (userRole?: UsersPermissionsRole): boolean => {
  const roleValue = userRoleToRoleValue(userRole);

  return roleValue === role.Admin || roleValue === role.Manager;
};
export const roleValueToRoleLabel = (
  userRole: RoleValue[keyof RoleValue],
): RoleLabel => {
  return (
    (Object.entries(role).find(([, value]) => value === userRole)?.[0] as
      | RoleLabel
      | undefined) ?? 'Authenticated'
  );
};
export const userToInitialUserValues = (
  user: UsersPermissionsUser,
): CreateUserValues => {
  return {
    username: user.username,
    email: user.email,
    password: '',
    repeatPassword: '',
    role: userRoleToRoleValue(user.role as UsersPermissionsRole | undefined),
  };
};

export const registerValues: RegisterValues = {
  username: '',
  email: '',
  password: '',
  repeatPassword: '',
};

const usernameSchema = yup
  .string()
  .required('Please supply a full name.')
  .matches(/^\w+ \w+$/, 'Name must consist of two segments.');

const repeatPasswordSchema = yup
  .mixed()
  .oneOf([yup.ref('password')], 'Passwords must match.');

const registerShape = {
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  repeatPassword: repeatPasswordSchema,
};

export const registerSchema = yup.object().required().shape(registerShape);

export interface CreateUserValues extends RegisterValues {
  role: RoleValue;
}
export const createUserValues: CreateUserValues = {
  ...registerValues,
  role: role.Authenticated,
};
export const createUserSchema = yup
  .object()
  .required()
  .shape({
    ...registerShape,
    role: roleSchema,
  });

export type UpdateUserValues = Pick<
  CreateUserValues,
  'username' | 'email' | 'role'
> &
  Partial<CreateUserValues>;
export const updateUserSchema = yup.object().required().shape({
  username: usernameSchema,
  email: emailSchema.notRequired(),
  password: passwordSchema.notRequired(),
  repeatPassword: repeatPasswordSchema,
  role: roleSchema,
});
