import { MdCreate, MdPerson, MdPersonAdd } from 'react-icons/md';
import TripsIcon from '../components/TripsIcon';
import { newKey } from '../config/config';

export const tripsRoute = {
  label: 'Trips',
  paths: ['/trips', '/'],
  Icon: TripsIcon,
} as const;

export const tripRoute = {
  label: 'Create Trip',
  paths: [`/trips/${newKey}`, '/trips/:id'],
  Icon: MdCreate,
} as const;

export const getNavigationRoutes = (canCrudUsers: boolean) =>
  ({
    trips: tripsRoute,
    trip: tripRoute,
    ...(canCrudUsers
      ? ({
          users: {
            label: 'Users',
            paths: ['/users'],
            Icon: MdPerson,
          },
          user: {
            label: 'Create User',
            paths: [`/users/${newKey}`, '/users/:id'],
            Icon: MdPersonAdd,
          },
        } as const)
      : {}),
  } as const);

export const loginRoute = {
  label: 'Login',
  paths: ['/login'],
  Icon: MdPerson,
} as const;
export const registerRoute = {
  label: 'Register',
  paths: ['/register'],
  Icon: MdPersonAdd,
} as const;

const getRoutes = (canCrudUsers: boolean) =>
  ({
    ...getNavigationRoutes(canCrudUsers),
    login: loginRoute,
    register: registerRoute,
  } as const);

export default getRoutes;

export type GetRoutes = typeof getRoutes;
export type Routes = ReturnType<GetRoutes>;
export type Route = Routes[keyof Routes];
export type Path = Route['paths'][number];
