import { RouteComponentProps, StaticContext } from 'react-router';
import { WithId, WithUser } from './models';

export const role = {
  Authenticated: 'Authenticated',
  Admin: 'Admin',
  Manager: 'Manager',
} as const;

export type Role = typeof role;
export type RoleLabel = keyof Role;
export type RoleValue = Role[keyof Role];

export type UserRouteProps = RouteComponentProps<
  WithId,
  StaticContext,
  WithUser | undefined
>;
