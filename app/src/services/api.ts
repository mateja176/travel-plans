import qs from 'qs';
import {
  Configuration,
  TripApi,
  UsersPermissionsRoleApi,
  UsersPermissionsUserApi,
} from '../generated/api';
import { getApiToken } from './services';

const basePath = process.env.REACT_APP_ORIGIN;

const configuration = new Configuration({
  basePath,
  accessToken: () => {
    const token = getApiToken();
    return token ?? '';
  },
  queryParamsStringify: qs.stringify.bind(qs),
});

export const userApi = new UsersPermissionsUserApi(configuration);
export const userRoleApi = new UsersPermissionsRoleApi(configuration);
export const tripApi = new TripApi(configuration);
